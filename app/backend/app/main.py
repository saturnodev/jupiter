import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import chat, conversations, sources
from app.config import settings
from app.vector_store.qdrant_client import ensure_collection

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Jupiter API", version="0.1.0")


@app.on_event("startup")
def startup():
    logger.info("Jupiter API starting up")
    Path(settings.storage_path).mkdir(parents=True, exist_ok=True)
    ensure_collection()
    logger.info("Storage path ready, Qdrant collection ensured")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
def http_exception_handler(request, exc: HTTPException):
    logger.warning("HTTP exception: %s %s", exc.status_code, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail if isinstance(exc.detail, str) else "Error", "detail": str(exc.detail)},
    )


@app.exception_handler(Exception)
def generic_exception_handler(request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    detail = str(exc) if settings.log_level.upper() == "DEBUG" else "An unexpected error occurred"
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": detail},
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
app.include_router(
    sources.router,
    prefix="/conversations/{conversation_id}/sources",
    tags=["sources"],
)
app.include_router(
    chat.router,
    prefix="/conversations/{conversation_id}/chat",
    tags=["chat"],
)
