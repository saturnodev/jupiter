from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Ollama
    ollama_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.2:1b"
    ollama_embedding_model: str = "nomic-embed-text"
    ollama_timeout: float = 120.0

    # Qdrant
    qdrant_host: str = "qdrant"
    qdrant_port: int = 6333

    # PostgreSQL
    database_url: str = "postgresql://jupiter:jupiter_secret@postgres:5432/jupiter"

    # Storage
    storage_path: str = "/app/storage"

    # API / CORS
    api_url: str = "http://localhost:8000"
    cors_origins: list[str] = ["http://localhost:4200", "http://localhost"]

    # Limits
    max_file_size_mb: int = 20
    max_files_per_conversation: int = 50

    # RAG
    rag_top_k: int = 5
    rag_history_limit: int = 10
    rag_chunk_size: int = 800
    rag_chunk_overlap: int = 100
    embed_batch_size: int = 15  # chunks per Ollama embed request (evita timeout en PDFs grandes)

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
