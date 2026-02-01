from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatSourceRef(BaseModel):
    filename: str
    chunk_index: int


class ChatResponse(BaseModel):
    content: str
    sources: list[ChatSourceRef] | None = None
