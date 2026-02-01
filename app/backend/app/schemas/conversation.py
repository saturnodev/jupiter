from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.message import MessageResponse
from app.schemas.source import SourceResponse


class ConversationCreate(BaseModel):
    title: str | None = "Nueva conversación"


class ConversationResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(ConversationResponse):
    messages: list[MessageResponse] = []
    sources: list[SourceResponse] = []
