from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.conversation import ConversationCreate, ConversationDetail, ConversationResponse
from app.services.conversation_service import create, delete, get_by_id, list_all

router = APIRouter()


@router.post("/", response_model=ConversationResponse)
def create_conversation(
    body: ConversationCreate | None = Body(default=None),
    db: Session = Depends(get_db),
):
    title = (body.title if body else None) or "Nueva conversación"
    conversation = create(db, title=title)
    return conversation


@router.get("/", response_model=list[ConversationResponse])
def list_conversations(used_only: bool = True, db: Session = Depends(get_db)):
    """List conversations. By default only returns used ones (with messages or sources)."""
    return list_all(db, used_only=used_only)


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
):
    conversation = get_by_id(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
):
    deleted = delete(db, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
