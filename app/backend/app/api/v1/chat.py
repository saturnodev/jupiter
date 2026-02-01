from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.chat import ChatRequest, ChatResponse, ChatSourceRef
from app.services import chat_service
from app.services import conversation_service

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(
    conversation_id: UUID,
    body: ChatRequest,
    db: Session = Depends(get_db),
):
    if conversation_service.get_by_id(db, conversation_id) is None:
        raise HTTPException(404, detail="Conversation not found")

    try:
        response, sources = chat_service.send_message(
            db, conversation_id, body.message
        )
    except ValueError as e:
        raise HTTPException(404, detail=str(e))

    sources_ref = None
    if sources:
        sources_ref = [
            ChatSourceRef(filename=s["filename"], chunk_index=s["chunk_index"])
            for s in sources
        ]

    return ChatResponse(content=response, sources=sources_ref)


@router.post("/stream")
def chat_stream(
    conversation_id: UUID,
    body: ChatRequest,
    db: Session = Depends(get_db),
):
    if conversation_service.get_by_id(db, conversation_id) is None:
        raise HTTPException(404, detail="Conversation not found")

    def generate():
        try:
            for chunk in chat_service.send_message_stream(
                db, conversation_id, body.message
            ):
                for line in (chunk or "").split("\n"):
                    yield f"data: {line}\n"
                yield "\n"
        except ValueError as e:
            yield f"data: Error: {e}\n\n"
        except Exception as e:
            yield f"data: Error inesperado: {e}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
