from collections.abc import Iterator
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Conversation, Message
from app.services import rag_service


def send_message(
    db: Session,
    conversation_id: UUID,
    content: str,
) -> tuple[str, list[dict] | None]:
    """
    Process RAG question, persist user and assistant messages, return (response, sources).
    """
    response, sources = rag_service.ask(db, conversation_id, content)

    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=content,
    )
    db.add(user_msg)

    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=response,
    )
    db.add(assistant_msg)

    db.query(Conversation).filter(Conversation.id == conversation_id).update(
        {Conversation.updated_at: func.now()}
    )
    db.commit()

    return (response, sources)


def send_message_stream(
    db: Session,
    conversation_id: UUID,
    content: str,
) -> Iterator[str]:
    """
    Process RAG question with streaming. Yields chunks. Persists messages after streaming completes.
    User message is persisted after streaming so RAG history doesn't include current question.
    """
    full_response: list[str] = []
    for chunk in rag_service.ask_stream(db, conversation_id, content):
        full_response.append(chunk)
        yield chunk

    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=content,
    )
    db.add(user_msg)

    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content="".join(full_response),
    )
    db.add(assistant_msg)

    db.query(Conversation).filter(Conversation.id == conversation_id).update(
        {Conversation.updated_at: func.now()}
    )
    db.commit()
