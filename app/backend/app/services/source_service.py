from pathlib import Path
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Source
from app.services.chunker import chunk
from app.services.document_loader import load_from_path, EXTENSION_TO_LOADER
from app.services.embedding_service import embed_batch
from app.vector_store.qdrant_client import upsert_chunks, delete_by_source, ensure_collection


def _get_loader_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    loader = EXTENSION_TO_LOADER.get(ext)
    if not loader:
        raise ValueError(f"Unsupported file extension: {ext}")
    return loader


def process_and_store(
    db: Session,
    conversation_id: UUID,
    file_path: str,
    filename: str,
) -> Source:
    """
    Extract text from file, chunk, embed, store in Qdrant, and create Source in DB.
    """
    loader_type = _get_loader_type(filename)
    text = load_from_path(file_path, file_type=loader_type)
    chunks_list = chunk(text)

    source = Source(
        conversation_id=conversation_id,
        filename=filename,
        file_type=loader_type,
        file_path=file_path,
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    if chunks_list:
        vectors = embed_batch(chunks_list)
        ensure_collection()
        upsert_chunks(
            conversation_id=str(conversation_id),
            source_id=str(source.id),
            filename=filename,
            chunks=chunks_list,
            vectors=vectors,
        )

    return source


def process_and_store_from_url(
    db: Session,
    conversation_id: UUID,
    url: str,
    filename: str | None = None,
) -> Source:
    """Load content from URL, chunk, embed, store in Qdrant, and create Source in DB."""
    from app.services.document_loader import load_from_url

    text = load_from_url(url)
    chunks_list = chunk(text)

    if not filename:
        filename = url.split("/")[-1] or "web-page"
        if "?" in filename:
            filename = filename.split("?")[0]
        if not filename or "." not in filename:
            filename = "web-page.html"

    file_path = f"url:{url}"
    source = Source(
        conversation_id=conversation_id,
        filename=filename,
        file_type="url",
        file_path=file_path,
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    if chunks_list:
        vectors = embed_batch(chunks_list)
        ensure_collection()
        upsert_chunks(
            conversation_id=str(conversation_id),
            source_id=str(source.id),
            filename=filename,
            chunks=chunks_list,
            vectors=vectors,
        )

    return source


def list_sources(db: Session, conversation_id: UUID) -> list[Source]:
    return (
        db.query(Source)
        .filter(Source.conversation_id == conversation_id)
        .order_by(Source.created_at.desc())
        .all()
    )


def get_source(db: Session, source_id: UUID, conversation_id: UUID) -> Source | None:
    return (
        db.query(Source)
        .filter(Source.id == source_id, Source.conversation_id == conversation_id)
        .first()
    )


def count_sources(db: Session, conversation_id: UUID) -> int:
    return db.query(Source).filter(Source.conversation_id == conversation_id).count()


def delete_source(db: Session, source_id: UUID, conversation_id: UUID) -> bool:
    source = get_source(db, source_id, conversation_id)
    if source is None:
        return False
    delete_by_source(str(source_id))
    db.delete(source)
    db.commit()
    return True
