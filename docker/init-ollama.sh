#!/bin/sh
# Script para descargar los modelos Ollama necesarios para Jupiter.
# Ejecutar después de: docker-compose up -d
# Uso: ./docker/init-ollama.sh
# O con nombre de contenedor: OLLAMA_CONTAINER=mi-ollama ./docker/init-ollama.sh

set -e

OLLAMA_CONTAINER="${OLLAMA_CONTAINER:-jupiter-ollama-1}"
EMBED_MODEL="${EMBED_MODEL:-nomic-embed-text}"
LLM_MODEL="${LLM_MODEL:-llama3.2:3b}"

echo "Jupiter: Inicializando modelos Ollama en contenedor $OLLAMA_CONTAINER"
echo ""

if ! docker ps --format '{{.Names}}' | grep -q "^${OLLAMA_CONTAINER}$"; then
  echo "Error: El contenedor $OLLAMA_CONTAINER no está corriendo."
  echo "Ejecuta primero: docker-compose up -d"
  exit 1
fi

echo "Descargando modelo de embeddings: $EMBED_MODEL"
docker exec "$OLLAMA_CONTAINER" ollama pull "$EMBED_MODEL"

echo ""
echo "Descargando modelo LLM: $LLM_MODEL"
docker exec "$OLLAMA_CONTAINER" ollama pull "$LLM_MODEL"

echo ""
echo "Modelos instalados:"
docker exec "$OLLAMA_CONTAINER" ollama list

echo ""
echo "Jupiter: Inicialización de Ollama completada."
