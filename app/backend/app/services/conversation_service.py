from uuid import UUID

from sqlalchemy import or_, exists
from sqlalchemy.orm import Session, joinedload

from app.models import Conversation, Message, Source


def create(db: Session, title: str = "Nueva conversación") -> Conversation:
    conversation = Conversation(title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_all(db: Session, used_only: bool = True) -> list[Conversation]:
    q = db.query(Conversation).order_by(Conversation.updated_at.desc())
    if used_only:
        has_message = exists().where(Message.conversation_id == Conversation.id)
        has_source = exists().where(Source.conversation_id == Conversation.id)
        q = q.filter(or_(has_message, has_source))
    return q.all()


def get_by_id(db: Session, conversation_id: UUID) -> Conversation | None:
    return (
        db.query(Conversation)
        .options(
            joinedload(Conversation.messages),
            joinedload(Conversation.sources),
        )
        .filter(Conversation.id == conversation_id)
        .first()
    )


def delete(db: Session, conversation_id: UUID) -> bool:
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation is None:
        return False
    db.delete(conversation)
    db.commit()
    return True
