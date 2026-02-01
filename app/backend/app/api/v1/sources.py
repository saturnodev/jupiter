import uuid
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.config import settings
from app.schemas.source import SourceResponse, SourceUrlCreate
from app.services import conversation_service
from app.services import source_service

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx", ".xlsx", ".xls", ".pptx", ".ppt"}
MAX_FILE_SIZE_BYTES = settings.max_file_size_mb * 1024 * 1024


def _validate_file(filename: str, content: bytes) -> None:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail=f"File type not allowed: {ext}")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            400,
            detail=f"File too large. Max size: {settings.max_file_size_mb}MB",
        )


def _save_file(conversation_id: UUID, filename: str, content: bytes) -> str:
    storage = Path(settings.storage_path)
    conv_dir = storage / str(conversation_id)
    conv_dir.mkdir(parents=True, exist_ok=True)
    base = Path(filename).stem or "document"
    ext = Path(filename).suffix or ""
    unique_name = f"{uuid.uuid4().hex[:8]}-{base}{ext}"
    file_path = conv_dir / unique_name
    file_path.write_bytes(content)
    return str(file_path)


@router.post("/upload", response_model=list[SourceResponse])
async def upload_files(
    conversation_id: UUID,
    files: list[UploadFile] | None = None,
    file: UploadFile | None = None,
    db: Session = Depends(get_db),
):
    if conversation_service.get_by_id(db, conversation_id) is None:
        raise HTTPException(404, detail="Conversation not found")

    if files:
        upload_list = files
    elif file:
        upload_list = [file]
    else:
        raise HTTPException(400, detail="No files provided")

    count = source_service.count_sources(db, conversation_id)
    if count + len(upload_list) > settings.max_files_per_conversation:
        raise HTTPException(
            400,
            detail=f"Would exceed max {settings.max_files_per_conversation} sources per conversation",
        )

    saved: list[tuple[str, str]] = []
    for f in upload_list:
        if not f.filename:
            continue
        content = await f.read()
        _validate_file(f.filename, content)
        path = _save_file(conversation_id, f.filename, content)
        saved.append((path, f.filename))

    sources: list[SourceResponse] = []
    for path, filename in saved:
        source = source_service.process_and_store(db, conversation_id, path, filename)
        sources.append(source)

    return sources


@router.post("/upload-folder", response_model=list[SourceResponse])
async def upload_folder(
    conversation_id: UUID,
    files: list[UploadFile] | None = None,
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(400, detail="No files provided")
    return await upload_files(
        conversation_id=conversation_id,
        files=files,
        db=db,
    )


@router.post("/url", response_model=SourceResponse)
def add_url_source(
    conversation_id: UUID,
    body: SourceUrlCreate,
    db: Session = Depends(get_db),
):
    if conversation_service.get_by_id(db, conversation_id) is None:
        raise HTTPException(404, detail="Conversation not found")
    count = source_service.count_sources(db, conversation_id)
    if count >= settings.max_files_per_conversation:
        raise HTTPException(
            400,
            detail=f"Max {settings.max_files_per_conversation} sources per conversation",
        )
    source = source_service.process_and_store_from_url(
        db, conversation_id, body.url
    )
    return source


@router.get("/", response_model=list[SourceResponse])
def list_sources(
    conversation_id: UUID,
    db: Session = Depends(get_db),
):
    if conversation_service.get_by_id(db, conversation_id) is None:
        raise HTTPException(404, detail="Conversation not found")
    return source_service.list_sources(db, conversation_id)


@router.delete("/{source_id}", status_code=204)
def delete_source(
    conversation_id: UUID,
    source_id: UUID,
    db: Session = Depends(get_db),
):
    if not source_service.delete_source(db, source_id, conversation_id):
        raise HTTPException(404, detail="Source not found")
