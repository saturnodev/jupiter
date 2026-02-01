from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class SourceUrlCreate(BaseModel):
    url: str


class SourceResponse(BaseModel):
    id: UUID
    filename: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True
