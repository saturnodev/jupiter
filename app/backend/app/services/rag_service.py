from collections.abc import Iterator
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.services import conversation_service
from app.services.embedding_service import embed
from app.services.ollama_client import ollama_client
from app.vector_store.qdrant_client import search_chunks

NO_SOURCES_MSG = (
    "Aún no hay documentos anexados a esta conversación. "
    "Sube archivos (PDF, TXT, MD, DOCX, etc.) o añade una URL para poder responder preguntas basándome en ellos."
)


def _build_prompt(
    context: str,
    history: str,
    question: str,
) -> str:
    return f"""Eres un asistente que responde únicamente basándote en el contexto proporcionado.
Si la información no está en el contexto, di que no puedes responder con esa información.

Contexto:
{context}

Historial de la conversación:
{history if history.strip() else "(sin historial previo)"}

Pregunta del usuario: {question}

Respuesta:"""


def _format_history(messages: list) -> str:
    lines = []
    for m in messages:
        role_label = "Usuario" if m.role == "user" else "Asistente"
        lines.append(f"{role_label}: {m.content}")
    return "\n\n".join(lines) if lines else ""


def ask(
    db: Session,
    conversation_id: UUID,
    question: str,
) -> tuple[str, list[dict] | None]:
    """
    RAG pipeline: embed question, search Qdrant, build prompt, generate.
    Returns (response, chunks_used for citations) or (friendly_msg, None) if no sources.
    """
    conversation = conversation_service.get_by_id(db, conversation_id)
    if conversation is None:
        raise ValueError("Conversation not found")

    if not conversation.sources:
        return (NO_SOURCES_MSG, None)

    query_vector = embed(question)
    chunks = search_chunks(str(conversation_id), query_vector)
    if not chunks:
        return (NO_SOURCES_MSG, None)

    context = "\n\n---\n\n".join(
        f"[{c.get('filename', '')}]\n{c.get('text', '')}" for c in chunks
    )

    sorted_messages = sorted(
        conversation.messages,
        key=lambda m: m.created_at or "",
    )
    limit = settings.rag_history_limit
    recent = sorted_messages[-limit * 2 :] if limit else sorted_messages
    history = _format_history(recent)

    prompt = _build_prompt(context, history, question)
    response = ollama_client.generate(prompt)

    sources_for_response = [
        {"filename": c.get("filename", ""), "chunk_index": c.get("chunk_index", 0)}
        for c in chunks
    ]
    return (response, sources_for_response)


def ask_stream(
    db: Session,
    conversation_id: UUID,
    question: str,
) -> Iterator[str]:
    """
    RAG pipeline with streaming: embed, search, build prompt, generate stream.
    Yields each chunk. Returns empty if no sources.
    """
    conversation = conversation_service.get_by_id(db, conversation_id)
    if conversation is None:
        raise ValueError("Conversation not found")

    if not conversation.sources:
        yield NO_SOURCES_MSG
        return

    query_vector = embed(question)
    chunks = search_chunks(str(conversation_id), query_vector)
    if not chunks:
        yield NO_SOURCES_MSG
        return

    context = "\n\n---\n\n".join(
        f"[{c.get('filename', '')}]\n{c.get('text', '')}" for c in chunks
    )

    sorted_messages = sorted(
        conversation.messages,
        key=lambda m: m.created_at or "",
    )
    limit = settings.rag_history_limit
    recent = sorted_messages[-limit * 2 :] if limit else sorted_messages
    history = _format_history(recent)

    prompt = _build_prompt(context, history, question)
    for chunk in ollama_client.generate_stream(prompt):
        yield chunk
