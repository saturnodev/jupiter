from collections.abc import Iterator

import httpx

from app.config import settings


class OllamaClient:
    def __init__(
        self,
        base_url: str | None = None,
        embedding_model: str | None = None,
        llm_model: str | None = None,
        timeout: float | None = None,
    ):
        self.base_url = (base_url or settings.ollama_url).rstrip("/")
        self.embedding_model = embedding_model or settings.ollama_embedding_model
        self.llm_model = llm_model or settings.ollama_model
        self.timeout = timeout if timeout is not None else settings.ollama_timeout

    def embed(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/api/embed",
                json={"model": self.embedding_model, "input": text},
            )
            response.raise_for_status()
            data = response.json()
            embeddings = data.get("embeddings", [])
            if not embeddings:
                raise ValueError("Ollama returned no embeddings")
            return embeddings[0]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts. Ollama accepts array input."""
        if not texts:
            return []
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/api/embed",
                json={"model": self.embedding_model, "input": texts},
            )
            response.raise_for_status()
            data = response.json()
            embeddings = data.get("embeddings", [])
            if len(embeddings) != len(texts):
                raise ValueError(
                    f"Ollama returned {len(embeddings)} embeddings for {len(texts)} texts"
                )
            return embeddings

    def generate(self, prompt: str) -> str:
        """Generate text. Returns full response (no streaming)."""
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/api/generate",
                json={"model": self.llm_model, "prompt": prompt, "stream": False},
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")

    def generate_stream(self, prompt: str) -> Iterator[str]:
        """Generate text stream. Yields each chunk as it arrives."""
        import json

        with httpx.Client(timeout=self.timeout) as client:
            with client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json={"model": self.llm_model, "prompt": prompt, "stream": True},
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        data = json.loads(line)
                        chunk = data.get("response", "")
                        if chunk:
                            yield chunk


ollama_client = OllamaClient()
