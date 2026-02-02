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

GREETING_RESPONSE = (
    "¡Hola! Encantado de ayudarte. Tengo acceso a los documentos que anexaste; "
    "pregúntame lo que quieras sobre ellos y te respondo en base a su contenido."
)

_SALUDOS = (
    "hola", "holi", "hey", "hi", "hello", "buenos días", "buenas tardes", "buenas noches",
    "qué tal", "que tal", "qué hubo", "como estas", "cómo estás", "saludos", "buena",
)


def _is_greeting(question: str) -> bool:
    q = question.strip().lower()
    if not q or len(q) > 80:
        return False
    if q in _SALUDOS:
        return True
    # Frases cortas que son solo saludo
    if q.startswith(("hola ", "hola,", "buenos días", "buenas tardes", "buenas noches", "qué tal", "que tal")):
        return True
    return False


def _build_prompt(
    context: str,
    history: str,
    question: str,
) -> str:
    return f"""Eres un asistente amable que responde en español usando solo el siguiente contexto (documentos anexados por el usuario).

Reglas:
- Sé siempre amable. Si el usuario te saluda (hola, buenos días, qué tal, etc.), responde primero al saludo de forma cordial y breve, y di que puedes responder preguntas sobre sus documentos; es el inicio de la conversación.
- Si preguntan "de qué tratan mis fuentes" o similar, resume brevemente el contenido del contexto.
- Para otras preguntas, responde solo con base en el contexto. Si algo no está en el contexto, dilo brevemente.
- No des disclaimers largos ni digas que "no puedes proporcionar asistencia". Responde de forma directa y útil.

Contexto (contenido de los documentos):
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

    if _is_greeting(question):
        return (GREETING_RESPONSE, None)

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

    if _is_greeting(question):
        yield GREETING_RESPONSE
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
