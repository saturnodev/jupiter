from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models import Conversation


def create(db: Session, title: str = "Nueva conversación") -> Conversation:
    conversation = Conversation(title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_all(db: Session) -> list[Conversation]:
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()


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
