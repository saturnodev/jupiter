# Docker — Jupiter

Configuración Docker para Jupiter. Los archivos principales están en la raíz del proyecto.

## Estructura

```
jupiter/
├── docker-compose.yml    # Orquestación de servicios
├── .env.example          # Variables de entorno de ejemplo
├── docker/               # Esta carpeta (scripts, documentación)
│   ├── README.md
│   └── init-ollama.sh    # Script para descargar modelos Ollama
└── app/
    ├── backend/          # FastAPI (Dockerfile)
    └── frontend/         # Angular (Dockerfile)
```

## Servicios

| Servicio   | Puerto | Descripción                          |
|------------|--------|--------------------------------------|
| postgres   | 5432   | Base de datos (conversaciones, mensajes) |
| qdrant     | 6333   | Base vectorial (embeddings)          |
| ollama     | 11434  | LLM y embeddings locales             |
| backend    | 8000   | API FastAPI                          |
| frontend   | 4200   | Angular servido por nginx            |

## Orden de inicio

1. **postgres** — Inicia primero, con healthcheck; backend espera a que esté listo
2. **qdrant** y **ollama** — Inician en paralelo
3. **backend** — Espera postgres (healthy) y qdrant/ollama; ejecuta migraciones Alembic; crea colección Qdrant en startup
4. **frontend** — Espera backend

## Inicialización

### Pasos obligatorios

1. Copiar `.env.example` a `.env` en la raíz.
2. Ejecutar: `docker-compose up --build` (o `docker-compose up -d` si ya construiste antes)

### Modelos Ollama

Para que RAG funcione, descarga los modelos Ollama tras iniciar el stack:

```bash
./docker/init-ollama.sh
```

O manualmente:

```bash
docker exec jupiter-ollama-1 ollama pull nomic-embed-text
docker exec jupiter-ollama-1 ollama pull llama3.2:1b
```

El nombre del contenedor puede variar (`jupiter-ollama-1` es el típico). Lista contenedores: `docker ps`.

## Volúmenes

| Volumen        | Servicio | Uso                              |
|----------------|----------|----------------------------------|
| postgres_data  | postgres | Datos de PostgreSQL             |
| qdrant_data    | qdrant   | Vectores de embeddings          |
| ollama_data    | ollama   | Modelos descargados             |
| storage_data   | backend  | Archivos subidos por usuarios   |

## Comandos útiles

```bash
# Iniciar en segundo plano
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# Ver modelos Ollama instalados
docker exec jupiter-ollama-1 ollama list

# Verificar health del backend
curl http://localhost:8000/health

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (borra datos)
docker-compose down -v
```

Ver [README.md](../README.md) en la raíz para instrucciones completas de instalación.
