# Jupiter — Plan de Trabajo (Workplan)

Plan de desarrollo por sprints con requerimientos técnicos, funcionales y no funcionales, en orden técnico lógico.

---

## Resumen de avance

**Instrucciones:** Marcar con `[x]` los requerimientos completados. El porcentaje se calcula como: completados / total × 100.

| Sprint | Técnicos | Funcionales | No func. | Total | % Avance |
|--------|----------|-------------|----------|-------|----------|
| Sprint 1 | 7/7 | 3/3 | 3/3 | 13/13 | 100% |
| Sprint 2 | 8/8 | 5/5 | 3/3 | 16/16 | 100% |
| Sprint 3 | 8/8 | 6/6 | 4/4 | 18/18 | 100% |
| Sprint 4 | 7/7 | 6/6 | 3/3 | 16/16 | 100% |
| Sprint 5 | 10/10 | 11/11 | 3/3 | 24/24 | 100% |
| Sprint 6 | 6/6 | 5/5 | 3/3 | 14/14 | 100% |
| **Total** | **46/46** | **36/36** | **19/19** | **101/101** | **100%** |

---

## Sprint 1: Fundamentos e Infraestructura

**Objetivo:** Establecer la base del proyecto, estructura de carpetas y stack Docker operativo.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T1.1 | [x] | Definir estructura de carpetas: `backend/`, `frontend/`, `docker/`, `.env.example` |
| T1.2 | [x] | Crear `docker-compose.yml` con servicios: PostgreSQL, Qdrant, Ollama |
| T1.3 | [x] | Definir variables de entorno: `OLLAMA_URL`, `OLLAMA_MODEL`, `QDRANT_HOST`, `QDRANT_PORT`, `POSTGRES_*`, `API_URL` |
| T1.4 | [x] | Crear Dockerfile para backend (Python/FastAPI) y frontend (Angular) |
| T1.5 | [x] | Configurar red interna Docker para comunicación entre servicios |
| T1.6 | [x] | Documentar `.env.example` con todas las variables y valores por defecto |
| T1.7 | [x] | Configurar límites de memoria por contenedor: stack total ≤ 6 GB RAM |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F1.1 | [x] | Los servicios deben iniciarse con `docker-compose up` |
| F1.2 | [x] | PostgreSQL debe persistir datos en volumen |
| F1.3 | [x] | Qdrant debe persistir vectores en volumen |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF1.1 | [x] | Tiempo de arranque del stack < 60 segundos |
| NF1.2 | [x] | Documentación de instalación en README |
| NF1.3 | [x] | Stack Docker completo no debe exceder 6 GB RAM (uso en computadora local) |

---

## Sprint 2: Backend — API Base y Persistencia

**Objetivo:** Backend operativo con modelos de datos, PostgreSQL y APIs base.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T2.1 | [x] | Crear proyecto FastAPI con estructura: `app/`, `routers/`, `models/`, `services/`, `config/` |
| T2.2 | [x] | Configurar SQLAlchemy + Alembic para PostgreSQL |
| T2.3 | [x] | Definir modelo `Conversation` (id, title, created_at, updated_at) |
| T2.4 | [x] | Definir modelo `Message` (id, conversation_id, role, content, created_at) |
| T2.5 | [x] | Definir modelo `Source` (id, conversation_id, filename, file_type, file_path, created_at) |
| T2.6 | [x] | Crear migraciones iniciales |
| T2.7 | [x] | Implementar configuración desde variables de entorno (Pydantic Settings) |
| T2.8 | [x] | Endpoint de health check: `GET /health` |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F2.1 | [x] | `POST /conversations` — Crear conversación |
| F2.2 | [x] | `GET /conversations` — Listar conversaciones (ordenadas por fecha) |
| F2.3 | [x] | `GET /conversations/{id}` — Obtener conversación con mensajes y fuentes |
| F2.4 | [x] | `DELETE /conversations/{id}` — Eliminar conversación |
| F2.5 | [x] | Mensajes asociados a conversación deben persistirse |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF2.1 | [x] | API debe responder en < 200ms para operaciones CRUD |
| NF2.2 | [x] | Manejo de errores con respuestas JSON estructuradas |
| NF2.3 | [x] | CORS configurado para el frontend Angular |

---

## Sprint 3: Procesamiento de Documentos y Embeddings

**Objetivo:** Carga de documentos, extracción de texto, chunking y almacenamiento en Qdrant.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T3.1 | [x] | Integrar LangChain o implementación directa de document loaders |
| T3.2 | [x] | Implementar loaders: PDF (pypdf), TXT, Markdown, DOCX (python-docx), Excel (openpyxl), PowerPoint (python-pptx) |
| T3.3 | [x] | Implementar loader para URLs web (requests + BeautifulSoup) |
| T3.4 | [x] | Definir estrategia de chunking (tamaño ~500-1000 tokens, overlap configurable) |
| T3.5 | [x] | Integrar Ollama para embeddings (`nomic-embed-text` por defecto) |
| T3.6 | [x] | Configurar cliente Qdrant: crear colecciones por conversación o namespaces |
| T3.7 | [x] | Almacenar vectores con metadata: `conversation_id`, `source_id`, `chunk_index` |
| T3.8 | [x] | API de subida de archivos con validación de tipos y tamaño |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F3.1 | [x] | `POST /conversations/{id}/sources/upload` — Subir uno o varios archivos |
| F3.2 | [x] | `POST /conversations/{id}/sources/upload-folder` — Subir contenido de carpeta |
| F3.3 | [x] | `GET /conversations/{id}/sources` — Listar fuentes anexadas |
| F3.4 | [x] | `DELETE /conversations/{id}/sources/{source_id}` — Eliminar fuente y sus vectores |
| F3.5 | [x] | Al subir archivo: extraer texto → chunkear → generar embeddings → guardar en Qdrant |
| F3.6 | [x] | Soporte para: PDF, MD, TXT, DOCX, Excel, PowerPoint, URLs web |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF3.1 | [x] | Límite de tamaño por archivo (ej. 20MB) |
| NF3.2 | [x] | Límite de archivos por conversación (ej. 50) |
| NF3.3 | [x] | Procesamiento asíncrono o en background para archivos grandes |
| NF3.4 | [x] | Validación estricta de tipos MIME |

---

## Sprint 4: Pipeline RAG y LLM

**Objetivo:** Pipeline RAG completo: búsqueda semántica, contexto y generación con Ollama.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T4.1 | [x] | Implementar búsqueda por similitud en Qdrant (top-k configurable, ej. 5-10 chunks) |
| T4.2 | [x] | Construir prompt con: system prompt + contexto (chunks relevantes) + historial reciente + pregunta |
| T4.3 | [x] | Integrar Ollama para generación (modelo configurable vía `OLLAMA_MODEL`, default `llama3.2:3b`) |
| T4.4 | [x] | Implementar streaming de respuesta (Server-Sent Events - SSE) |
| T4.5 | [x] | Persistir mensajes (user + assistant) en PostgreSQL tras completar respuesta |
| T4.6 | [x] | Manejar caso sin fuentes: responder indicando que se deben anexar fuentes |
| T4.7 | [x] | Incluir citas/fuentes en metadata de respuesta (opcional, chunks usados) |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F4.1 | [x] | `POST /conversations/{id}/chat` — Enviar pregunta, recibir respuesta (JSON con texto completo) |
| F4.2 | [x] | `POST /conversations/{id}/chat/stream` — Enviar pregunta, recibir SSE con chunks de texto |
| F4.3 | [x] | Respuesta basada únicamente en fuentes anexadas a la conversación |
| F4.4 | [x] | Historial de mensajes de la conversación incluido en contexto del LLM (ventana N últimos) |
| F4.5 | [x] | Si no hay fuentes: respuesta amigable pidiendo anexar documentos |
| F4.6 | [x] | Respuesta final completa disponible al finalizar streaming |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF4.1 | [x] | Latencia de primera respuesta (TTFT) < 5 segundos |
| NF4.2 | [x] | Streaming fluido (chunks cada ~50-200ms) |
| NF4.3 | [x] | Timeout configurable para llamadas a Ollama |

---

## Sprint 5: Frontend — Angular y UI de Chat

**Objetivo:** Interfaz Angular con estética synthwave, lista de conversaciones, chat y subida de archivos.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T5.1 | [x] | Crear proyecto Angular (standalone components, routing) |
| T5.2 | [x] | Definir diseño synthwave: paleta (púrpura, rosa, cian, neón), tipografía, variables CSS |
| T5.3 | [x] | Implementar servicio HTTP para API backend |
| T5.4 | [x] | Implementar servicio de streaming (EventSource/SSE) |
| T5.5 | [x] | Componente de lista de conversaciones (sidebar o panel) |
| T5.6 | [x] | Componente de chat: área de mensajes, input, indicador de typing/streaming |
| T5.7 | [x] | Componente de subida: selector de archivos + selector de carpeta |
| T5.8 | [x] | Componente de fuentes anexadas (listar, eliminar) |
| T5.9 | [x] | Responsive básico (desktop first) |
| T5.10 | [x] | Proxy o configuración CORS para desarrollo local |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F5.1 | [x] | Pantalla principal: lista de conversaciones a la izquierda, chat a la derecha |
| F5.2 | [x] | Crear nueva conversación con un clic |
| F5.3 | [x] | Seleccionar conversación para ver historial y continuar chat |
| F5.4 | [x] | Subir archivos individuales (drag & drop o selector) |
| F5.5 | [x] | Subir carpeta completa (selector de directorio) |
| F5.6 | [x] | Mostrar lista de fuentes anexadas por conversación |
| F5.7 | [x] | Eliminar fuente desde la UI |
| F5.8 | [x] | Enviar mensaje y ver respuesta en streaming (texto apareciendo poco a poco) |
| F5.9 | [x] | Mostrar respuesta final completa al terminar streaming |
| F5.10 | [x] | Historial de mensajes visible al abrir conversación |
| F5.11 | [x] | Estética synthwave: gradientes, neón, look moderno/retro-futurista |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF5.1 | [x] | UI accesible (contraste, focus visible) |
| NF5.2 | [x] | Feedback visual en acciones (loading, éxito, error) |
| NF5.3 | [x] | Sin dependencias innecesarias (bundle size razonable) |

---

## Sprint 6: Integración, Pruebas y Documentación

**Objetivo:** Integración end-to-end, validación y documentación para despliegue.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T6.1 | [x] | Integrar backend + frontend en `docker-compose` (orquestación completa) |
| T6.2 | [x] | Script o instrucciones para descargar modelo Ollama (`ollama pull llama3.2:3b`, `nomic-embed-text`) |
| T6.3 | [x] | Script de inicialización (migraciones DB, colección Qdrant) |
| T6.4 | [x] | Pruebas E2E básicas o checklist manual de flujos críticos |
| T6.5 | [x] | Logging estructurado en backend |
| T6.6 | [x] | Manejo de errores de red en frontend (reintentos, mensajes claros) |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F6.1 | [x] | Flujo completo: crear conversación → subir PDF → hacer pregunta → recibir respuesta con streaming |
| F6.2 | [x] | Flujo de carga masiva: subir carpeta → ver fuentes → hacer pregunta |
| F6.3 | [x] | Persistencia: cerrar navegador, volver, ver conversaciones y historial |
| F6.4 | [x] | Documentación: README con requisitos, instalación, variables de entorno |
| F6.5 | [x] | Documentación: ejemplos de uso con `docker-compose` |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF6.1 | [x] | Proyecto ejecutable con `docker-compose up --build` |
| NF6.2 | [x] | Sin secretos hardcodeados |
| NF6.3 | [x] | Licencia open source clara (README + LICENSE) |

---

## Resumen de Sprints

| Sprint | Foco | Entregable Principal |
|--------|------|----------------------|
| 1 | Infraestructura | Docker stack operativo |
| 2 | API Base | CRUD conversaciones, persistencia PostgreSQL |
| 3 | Documentos | Carga y vectorización en Qdrant |
| 4 | RAG | Pipeline RAG + streaming con Ollama |
| 5 | Frontend | UI Angular synthwave + chat + subida archivos |
| 6 | Integración | E2E funcional, documentación, despliegue |

---

## Orden de Dependencias

```
Sprint 1 ──► Sprint 2 ──► Sprint 3 ──► Sprint 4
                                    │
                                    └──► Sprint 5 ──► Sprint 6
```

- **Sprint 3** puede iniciarse en paralelo parcial con Sprint 2 (una vez modelos base definidos).
- **Sprint 5** puede iniciar componentes UI antes de tener streaming, usando mocks.

---

## Cómo actualizar el avance

1. **Marcar completado:** Cambiar `[ ]` por `[x]` en el requerimiento completado.
2. **Actualizar tabla de resumen:** Contar los `[x]` por categoría (Técnicos, Funcionales, No func.) y por sprint.
3. **Calcular porcentaje:** `% = (completados / total) × 100`.
4. **Ejemplo:** Si Sprint 1 tiene 6 técnicos marcados como `[x]` de 6 totales → Técnicos: 6/6 (100%).
