from app.config import settings


def chunk(
    text: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[str]:
    """
    Split text into overlapping chunks by character count.
    chunk_size and overlap default to RAG_CHUNK_SIZE and RAG_CHUNK_OVERLAP from settings.
    """
    if not text or not text.strip():
        return []

    size = chunk_size if chunk_size is not None else settings.rag_chunk_size
    overlap_chars = overlap if overlap is not None else settings.rag_chunk_overlap

    if overlap_chars >= size:
        overlap_chars = max(0, size - 1)

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + size
        chunk_text = text[start:end]
        if not chunk_text.strip():
            start = end - overlap_chars
            continue
        chunks.append(chunk_text.strip())
        start = end - overlap_chars
        if start >= len(text):
            break

    return chunks
