from app.services.ollama_client import ollama_client


def embed(text: str) -> list[float]:
    """Generate embedding for a single text."""
    return ollama_client.embed(text)


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts."""
    return ollama_client.embed_batch(texts)
