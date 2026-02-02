# Jupiter — Arquitectura de Software

Documento de referencia para desarrolladores. Especifica la arquitectura detallada de la solución Jupiter con buenas prácticas.

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Diagrama de arquitectura](#2-diagrama-de-arquitectura)
3. [Flujo de datos](#3-flujo-de-datos)
4. [Frontend (Angular)](#4-frontend-angular)
5. [Backend (FastAPI)](#5-backend-fastapi)
6. [Base vectorial (Qdrant)](#6-base-vectorial-qdrant)
7. [Base de datos (PostgreSQL)](#7-base-de-datos-postgresql)
8. [Integración con Ollama](#8-integración-con-ollama)
9. [Configuración y variables de entorno](#9-configuración-y-variables-de-entorno) (incl. requisitos RAM)
10. [Buenas prácticas transversales](#10-buenas-prácticas-transversales)

---

## 1. Visión general

Jupiter es una aplicación web de tipo **notebook + chatbot RAG** con arquitectura de tres capas:

| Capa | Tecnología | Responsabilidad |
|------|------------|-----------------|
| **Presentación** | Angular | UI, interacción, streaming de respuestas |
| **Aplicación** | FastAPI | Lógica de negocio, orquestación RAG, APIs REST |
| **Datos** | PostgreSQL + Qdrant | Metadatos + vectores |

El LLM y los embeddings corren en **Ollama** como servicio externo local.

---

## 2. Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CAPA DE PRESENTACIÓN                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                        Angular (frontend/)                                  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │  │
│  │  │ Sidebar     │ │ Chat        │ │ FileUpload  │ │ SourcesList         │   │  │
│  │  │ (convers.)  │ │ (mensajes)  │ │ (archivos)  │ │ (fuentes anexadas)  │   │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │  │
│  │         HTTP/REST + SSE (streaming)                                         │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CAPA DE APLICACIÓN                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                        FastAPI (backend/)                                   │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │  │
│  │  │ Routers      │ │ Services     │ │ RAG Pipeline │ │ Document Loaders │   │  │
│  │  │ (convers.,   │ │ (convers.,   │ │ (retrieve +  │ │ (PDF, DOCX, web) │   │  │
│  │  │  sources,    │ │  sources,    │ │  generate)   │ │                  │   │  │
│  │  │  chat)       │ │  chat)       │ │              │ │                  │   │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  PostgreSQL     │  │  Qdrant         │  │  Ollama         │  │  Storage        │
│  (conversaciones│  │  (vectores de   │  │  (LLM +         │  │  (archivos      │
│   mensajes,     │  │   chunks)       │  │   embeddings)   │  │   subidos)      │
│   fuentes)      │  │                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 3. Flujo de datos

### 3.1 Subida de documento

```
Usuario sube archivo → Angular (FileUpload) → POST /conversations/{id}/sources/upload
       ↓
Backend recibe archivo → Guardar en storage (volumen)
       ↓
Document Loader extrae texto → Chunker divide en chunks
       ↓
Ollama genera embeddings → Qdrant almacena vectores + metadata (conversation_id, source_id)
       ↓
PostgreSQL: INSERT Source (filename, file_type, file_path)
```

### 3.2 Pregunta RAG

```
Usuario envía pregunta → Angular (Chat) → POST /conversations/{id}/chat/stream (SSE)
       ↓
Backend: embedding de la pregunta (Ollama)
       ↓
Qdrant: búsqueda por similitud (top-k chunks)
       ↓
Construir prompt: system + contexto (chunks) + historial + pregunta
       ↓
Ollama: generar respuesta (streaming)
       ↓
Backend: SSE → Angular muestra texto poco a poco
       ↓
Al finalizar: PostgreSQL INSERT Message (user), INSERT Message (assistant)
```

---

## 4. Frontend (Angular)

### 4.1 Estructura de carpetas recomendada

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios singleton, guards, interceptors
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts           # HTTP cliente base
│   │   │   │   ├── conversation.service.ts
│   │   │   │   ├── source.service.ts
│   │   │   │   └── chat.service.ts          # Incluye streaming SSE
│   │   │   └── interceptors/
│   │   │       └── error.interceptor.ts
│   │   ├── shared/                  # Componentes y pipes reutilizables
│   │   │   ├── components/
│   │   │   └── pipes/
│   │   ├── features/
│   │   │   ├── conversations/       # Lista de conversaciones
│   │   │   │   ├── conversation-list/
│   │   │   │   └── conversation-list.component.ts
│   │   │   ├── chat/                # Área de chat
│   │   │   │   ├── chat-messages/
│   │   │   │   ├── chat-input/
│   │   │   │   └── chat.component.ts
│   │   │   ├── sources/             # Fuentes anexadas
│   │   │   │   ├── source-list/
│   │   │   │   └── source-upload/
│   │   │   └── layout/              # Layout principal (sidebar + main)
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   └── styles/
│   │       └── _variables.scss      # Variables synthwave
│   └── environments/
├── angular.json
└── package.json
```

### 4.2 Diseño Synthwave

**Variables CSS recomendadas** (en `_variables.scss` o `styles.scss`):

```scss
:root {
  // Colores principales
  --synth-primary: #ff6ec7;      // Rosa neón
  --synth-secondary: #00f5ff;    // Cian neón
  --synth-accent: #b388ff;       // Púrpura
  --synth-bg-dark: #0d0221;      // Fondo oscuro
  --synth-bg-card: #1a0b2e;      // Fondo tarjetas
  --synth-text: #e0e0e0;
  --synth-text-muted: #9e9e9e;

  // Gradientes
  --synth-gradient-main: linear-gradient(135deg, #ff6ec7 0%, #00f5ff 50%, #b388ff 100%);
  --synth-gradient-card: linear-gradient(180deg, rgba(179, 136, 255, 0.1) 0%, transparent 100%);

  // Sombras neón
  --synth-glow-pink: 0 0 20px rgba(255, 110, 199, 0.5);
  --synth-glow-cyan: 0 0 20px rgba(0, 245, 255, 0.5);
}
```

**Buenas prácticas UI:**
- Usar `@Input()` y `@Output()` para comunicación padre-hijo.
- Evitar lógica pesada en templates; usar pipes o métodos en componentes.
- Mantener componentes pequeños y enfocados (Single Responsibility).

### 4.3 Servicios

**ApiService** — Cliente HTTP base con `HttpClient`, URL base desde `environment`.

**ConversationService** — CRUD conversaciones:
- `getConversations()`, `createConversation()`, `getConversation(id)`, `deleteConversation(id)`

**SourceService** — Subida y gestión de fuentes:
- `uploadFiles(conversationId, files)`, `uploadFolder(conversationId, files)`, `getSources(conversationId)`, `deleteSource(conversationId, sourceId)`

**ChatService** — Preguntas y streaming:
- `sendMessage(conversationId, content)` → Observable con respuesta completa
- `sendMessageStream(conversationId, content)` → Observable con chunks (EventSource/SSE)

### 4.4 Streaming SSE en Angular

```typescript
// Ejemplo conceptual de consumo de SSE
sendMessageStream(conversationId: string, content: string): Observable<string> {
  return new Observable(subscriber => {
    const url = `${this.apiUrl}/conversations/${conversationId}/chat/stream`;
    const eventSource = new EventSource(`${url}?message=${encodeURIComponent(content)}`);
    // O usar fetch con ReadableStream si se usa POST con body
    eventSource.onmessage = (event) => subscriber.next(event.data);
    eventSource.onerror = () => { eventSource.close(); subscriber.complete(); };
    return () => eventSource.close();
  });
}
```

**Nota:** Si el endpoint usa POST con body, considerar `fetch` + `ReadableStream` en lugar de `EventSource`.

### 4.5 Routing

```
/                    → Layout con conversación vacía o última
/conversations/:id   → Layout con conversación cargada
```

---

## 5. Backend (FastAPI)

### 5.1 Estructura de carpetas recomendada

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, CORS, routers
│   ├── config.py               # Pydantic Settings (variables de entorno)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencias (DB session, etc.)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── conversations.py
│   │       ├── sources.py
│   │       └── chat.py
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   └── source.py
│   ├── schemas/                # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   └── source.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── conversation_service.py
│   │   ├── source_service.py
│   │   ├── document_loader.py   # Carga y extracción de texto
│   │   ├── chunker.py          # Estrategia de chunking
│   │   ├── embedding_service.py
│   │   ├── rag_service.py      # Pipeline RAG completo
│   │   └── ollama_client.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py          # SessionLocal, engine
│   │   └── base.py
│   └── vector_store/           # Integración Qdrant
│       ├── __init__.py
│       └── qdrant_client.py
├── alembic/                    # Migraciones
├── requirements.txt
└── Dockerfile
```

### 5.2 Capas y responsabilidades

| Capa | Responsabilidad | No debe |
|------|-----------------|---------|
| **Routers** | Validar entrada, llamar servicios, formatear respuesta | Lógica de negocio, acceso directo a DB |
| **Services** | Lógica de negocio, orquestación | Validación de esquemas HTTP |
| **Models** | Definición de tablas SQLAlchemy | Lógica de negocio |
| **Schemas** | Contratos de API (Pydantic) | Lógica de negocio |
| **Vector store** | Operaciones con Qdrant | Lógica RAG |

### 5.3 Patrones recomendados

- **Dependency Injection:** Usar `Depends()` para sesión DB, servicios.
- **Transacciones:** Envolver operaciones multi-paso en `with db.begin()` o equivalente.
- **Errores:** `HTTPException` con códigos apropiados; respuestas JSON estructuradas.
- **Async:** Preferir `async def` para endpoints que esperan I/O (DB, Ollama, Qdrant).
- **Background tasks:** Usar `BackgroundTasks` para procesamiento de archivos grandes (chunking + embeddings).

### 5.4 Endpoints API (contrato)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/conversations` | Listar conversaciones (orden por updated_at desc) |
| POST | `/conversations` | Crear conversación |
| GET | `/conversations/{id}` | Obtener conversación con mensajes y fuentes |
| DELETE | `/conversations/{id}` | Eliminar conversación |
| POST | `/conversations/{id}/sources/upload` | Subir archivos (multipart/form-data) |
| POST | `/conversations/{id}/sources/upload-folder` | Subir archivos de carpeta |
| GET | `/conversations/{id}/sources` | Listar fuentes |
| DELETE | `/conversations/{id}/sources/{source_id}` | Eliminar fuente |
| POST | `/conversations/{id}/chat` | Pregunta (respuesta JSON completa) |
| POST | `/conversations/{id}/chat/stream` | Pregunta (respuesta SSE) |

---

## 6. Base vectorial (Qdrant)

### 6.1 Modelo de datos

**Colección única** `jupiter_chunks` con:
- **Vectores:** Dimensión según modelo de embeddings (ej. 768 para `nomic-embed-text`)
- **Payload (metadata):**
  - `conversation_id` (string)
  - `source_id` (string, UUID)
  - `chunk_index` (int)
  - `text` (string) — opcional, para debug o citas
  - `filename` (string)

### 6.2 Filtrado por conversación

Usar **filtro** en cada búsqueda:

```python
from qdrant_client.models import Filter, FieldCondition, MatchValue

filter_condition = Filter(
    must=[
        FieldCondition(key="conversation_id", match=MatchValue(value=conversation_id))
    ]
)
```

Así todos los vectores pueden vivir en una sola colección; el filtro aísla por conversación.

### 6.3 Buenas prácticas Qdrant

| Práctica | Descripción |
|----------|-------------|
| **Índice HNSW** | Usar por defecto; ajustar `m` y `ef_construct` si hay muchos vectores |
| **Distancia** | Cosine para embeddings de texto (nomic-embed-text) |
| **Batch upsert** | Insertar chunks en lotes (ej. 50-100) para mejor rendimiento |
| **Eliminar por filtro** | Al borrar fuente: `delete(collection_name, points_selector=Filter(...))` |
| **Persistencia** | Configurar volumen Docker para `qdrant_storage` |
| **Dimensión** | Crear colección con `vectors_config` acorde al modelo de embeddings |

### 6.4 Creación de colección

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

client.create_collection(
    collection_name="jupiter_chunks",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),  # Ajustar size según modelo
    optimizers_config={...}  # Opcional
)
```

---

## 7. Base de datos (PostgreSQL)

### 7.1 Modelo entidad-relación

```
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│   conversations     │       │      messages       │       │      sources        │
├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
│ id (UUID, PK)       │◄──┐   │ id (UUID, PK)       │       │ id (UUID, PK)       │
│ title (VARCHAR)     │   │   │ conversation_id (FK)│   ┌───│ conversation_id (FK)│
│ created_at (TIMEST.)│   └───│ role (user/assistant│   │   │ filename (VARCHAR)  │
│ updated_at (TIMEST.)│       │ content (TEXT)      │   └──►│ file_type (VARCHAR) │
└─────────────────────┘       │ created_at (TIMEST.)│       │ file_path (VARCHAR) │
                              └─────────────────────┘       │ created_at (TIMEST.)│
                                                            └─────────────────────┘
```

### 7.2 Esquema SQL (referencia)

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) DEFAULT 'Nueva conversación',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at);
CREATE INDEX idx_sources_conversation ON sources(conversation_id);
```

### 7.3 Buenas prácticas PostgreSQL

| Práctica | Descripción |
|----------|-------------|
| **UUID para IDs** | Evita secuencias predecibles; útil para APIs públicas |
| **ON DELETE CASCADE** | Al eliminar conversación, se eliminan mensajes y fuentes |
| **Índices** | En FK y columnas de filtrado/ordenamiento |
| **updated_at** | Actualizar en conversación al crear mensaje |
| **Migraciones** | Usar Alembic; no modificar migraciones ya aplicadas |
| **Conexiones** | Pool de conexiones (SQLAlchemy `pool_size`, `max_overflow`) |
| **Transacciones** | Operaciones atómicas donde aplique (ej. crear conversación + primer mensaje) |
| **Preparación** | Usar prepared statements (SQLAlchemy lo hace por defecto) |

### 7.4 Convenciones de nombres

- Tablas: plural, snake_case (`conversations`, `messages`, `sources`)
- Columnas: snake_case (`created_at`, `conversation_id`)
- FKs: `{tabla_singular}_id`

---

## 8. Integración con Ollama

### 8.1 Endpoints utilizados

| Uso | Endpoint | Método |
|-----|----------|--------|
| Generar texto | `/api/generate` | POST |
| Generar texto (streaming) | `/api/generate` con `stream: true` | POST |
| Embeddings | `/api/embeddings` | POST |

### 8.2 Modelos por defecto

- **LLM:** `llama3.2:1b` (variable `OLLAMA_MODEL`)
- **Embeddings:** `nomic-embed-text` (variable `OLLAMA_EMBEDDING_MODEL` recomendada)

### 8.3 Buenas prácticas Ollama

- **Timeout:** Configurable (ej. 120s para generación)
- **Reintentos:** Implementar retry con backoff para fallos transitorios
- **Health check:** Verificar `GET /api/tags` antes de operaciones críticas
- **Streaming:** Usar `stream=True` y procesar chunks para responder rápido al usuario

---

## 9. Configuración y variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `OLLAMA_URL` | URL base de Ollama | `http://ollama:11434` |
| `OLLAMA_MODEL` | Modelo LLM | `llama3.2:1b` |
| `OLLAMA_EMBEDDING_MODEL` | Modelo embeddings | `nomic-embed-text` |
| `QDRANT_HOST` | Host Qdrant | `qdrant` |
| `QDRANT_PORT` | Puerto Qdrant | `6333` |
| `POSTGRES_HOST` | Host PostgreSQL | `postgres` |
| `POSTGRES_PORT` | Puerto PostgreSQL | `5432` |
| `POSTGRES_USER` | Usuario | `jupiter` |
| `POSTGRES_PASSWORD` | Contraseña | `***` |
| `POSTGRES_DB` | Nombre BD | `jupiter` |
| `DATABASE_URL` | URL SQLAlchemy | `postgresql://user:pass@host:port/db` |
| `STORAGE_PATH` | Ruta archivos subidos | `/app/storage` |
| `API_URL` | URL del backend (para CORS) | `http://localhost:8000` |
| `MAX_FILE_SIZE_MB` | Tamaño máximo archivo | `20` |
| `MAX_FILES_PER_CONVERSATION` | Límite archivos por conversación | `50` |
| `RAG_TOP_K` | Chunks a recuperar | `5` |
| `RAG_CHUNK_SIZE` | Tamaño de chunk (chars) | `800` |
| `RAG_CHUNK_OVERLAP` | Overlap entre chunks | `100` |

### 9.1 Requisitos de recursos (Docker)

**El stack completo no debe exceder 6 GB de RAM** para ejecución en computadora local.

Configurar límites por contenedor en `docker-compose.yml`:

```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 2.5G    # LLM (llama3.2:1b ~1.3GB)
  postgres:
    deploy:
      resources:
        limits:
          memory: 512M
  qdrant:
    deploy:
      resources:
        limits:
          memory: 512M
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
  frontend:
    deploy:
      resources:
        limits:
          memory: 256M
# Total aproximado: ~5 GB (margen para el host)
```

Ajustar según necesidades; mantener suma ≤ 6 GB para máquinas con RAM limitada.

---

## 10. Buenas prácticas transversales

### 10.1 Seguridad

- No exponer secretos en logs ni en respuestas API
- Validar tipos MIME y extensiones en subida de archivos
- Límites de tamaño y cantidad de archivos
- CORS restringido al origen del frontend
- Usar variables de entorno para credenciales

### 10.2 Rendimiento

- Índices adecuados en PostgreSQL
- Batch upsert en Qdrant
- Procesamiento asíncrono de archivos grandes
- Streaming para respuestas largas
- Pool de conexiones a BD

### 10.3 Límite de RAM (6 GB)

- **Objetivo:** Ejecución fluida en computadora local sin agotar recursos
- Configurar `deploy.resources.limits.memory` en cada servicio de `docker-compose`
- Ollama es el mayor consumidor (~1.3–2 GB para llama3.2:1b); priorizar su límite
- Mantener el total del stack ≤ 6 GB para que el host siga usable

### 10.4 Logging

- Formato estructurado (JSON)
- Niveles: DEBUG (dev), INFO (prod), ERROR
- Incluir `request_id` para trazabilidad
- No loguear datos sensibles

### 10.5 Manejo de errores

- Respuestas JSON consistentes: `{ "error": "...", "detail": "..." }`
- Códigos HTTP apropiados (400, 404, 422, 500)
- Mensajes claros para el usuario en frontend

### 10.6 Documentación

- OpenAPI (Swagger) automático en FastAPI (`/docs`)
- README con instrucciones de instalación
- Comentarios en código para lógica compleja
- Este documento (`arquitectura.md`) como referencia

---

*Última actualización: Febrero 2025*
