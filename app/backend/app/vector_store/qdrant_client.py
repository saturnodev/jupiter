import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    Filter,
    FieldCondition,
    MatchValue,
    PointStruct,
    VectorParams,
)

from app.config import settings

COLLECTION_NAME = "jupiter_chunks"
VECTOR_SIZE = 768


def get_client() -> QdrantClient:
    return QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)


def ensure_collection() -> None:
    """Create jupiter_chunks collection if it does not exist."""
    client = get_client()
    collections = client.get_collections().collections
    names = [c.name for c in collections]
    if COLLECTION_NAME not in names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )


def upsert_chunks(
    conversation_id: str,
    source_id: str,
    filename: str,
    chunks: list[str],
    vectors: list[list[float]],
) -> None:
    """Insert chunk vectors with metadata into Qdrant."""
    if len(chunks) != len(vectors):
        raise ValueError("chunks and vectors must have the same length")

    ensure_collection()
    client = get_client()

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vec,
            payload={
                "conversation_id": conversation_id,
                "source_id": source_id,
                "chunk_index": i,
                "text": chunks[i],
                "filename": filename,
            },
        )
        for i, vec in enumerate(vectors)
    ]

    client.upsert(collection_name=COLLECTION_NAME, points=points)


def delete_by_source(source_id: str) -> None:
    """Delete all points with the given source_id."""
    client = get_client()
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[FieldCondition(key="source_id", match=MatchValue(value=source_id))]
        ),
    )


def search_chunks(
    conversation_id: str,
    query_vector: list[float],
    top_k: int | None = None,
) -> list[dict]:
    """Search for similar chunks in a conversation. Returns list of {text, filename, chunk_index, source_id}."""
    client = get_client()
    limit = top_k if top_k is not None else settings.rag_top_k
    response = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="conversation_id", match=MatchValue(value=conversation_id)
                )
            ]
        ),
        limit=limit,
        with_payload=True,
    )
    results = response.points if hasattr(response, "points") else []
    return [
        {
            "text": hit.payload.get("text", ""),
            "filename": hit.payload.get("filename", ""),
            "chunk_index": hit.payload.get("chunk_index", 0),
            "source_id": hit.payload.get("source_id", ""),
        }
        for hit in results
    ]


def delete_by_conversation(conversation_id: str) -> None:
    """Delete all points with the given conversation_id."""
    client = get_client()
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="conversation_id", match=MatchValue(value=conversation_id)
                )
            ]
        ),
    )
