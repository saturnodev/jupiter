# Jupiter — Plan de Trabajo (Workplan)

Plan de desarrollo por sprints con requerimientos técnicos, funcionales y no funcionales, en orden técnico lógico.

---

## Resumen de avance

**Instrucciones:** Marcar con `[x]` los requerimientos completados. El porcentaje se calcula como: completados / total × 100.

| Sprint | Técnicos | Funcionales | No func. | Total | % Avance |
|--------|----------|-------------|----------|-------|----------|
| Sprint 1 | 0/7 | 0/3 | 0/3 | 0/13 | 0% |
| Sprint 2 | 0/8 | 0/5 | 0/3 | 0/16 | 0% |
| Sprint 3 | 0/8 | 0/6 | 0/4 | 0/18 | 0% |
| Sprint 4 | 0/7 | 0/6 | 0/3 | 0/16 | 0% |
| Sprint 5 | 0/10 | 0/11 | 0/3 | 0/24 | 0% |
| Sprint 6 | 0/6 | 0/5 | 0/3 | 0/14 | 0% |
| **Total** | **0/46** | **0/36** | **0/19** | **0/101** | **0%** |

---

## Sprint 1: Fundamentos e Infraestructura

**Objetivo:** Establecer la base del proyecto, estructura de carpetas y stack Docker operativo.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T1.1 | [ ] | Definir estructura de carpetas: `backend/`, `frontend/`, `docker/`, `.env.example` |
| T1.2 | [ ] | Crear `docker-compose.yml` con servicios: PostgreSQL, Qdrant, Ollama |
| T1.3 | [ ] | Definir variables de entorno: `OLLAMA_URL`, `OLLAMA_MODEL`, `QDRANT_HOST`, `QDRANT_PORT`, `POSTGRES_*`, `API_URL` |
| T1.4 | [ ] | Crear Dockerfile para backend (Python/FastAPI) y frontend (Angular) |
| T1.5 | [ ] | Configurar red interna Docker para comunicación entre servicios |
| T1.6 | [ ] | Documentar `.env.example` con todas las variables y valores por defecto |
| T1.7 | [ ] | Configurar límites de memoria por contenedor: stack total ≤ 6 GB RAM |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F1.1 | [ ] | Los servicios deben iniciarse con `docker-compose up` |
| F1.2 | [ ] | PostgreSQL debe persistir datos en volumen |
| F1.3 | [ ] | Qdrant debe persistir vectores en volumen |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF1.1 | [ ] | Tiempo de arranque del stack < 60 segundos |
| NF1.2 | [ ] | Documentación de instalación en README |
| NF1.3 | [ ] | Stack Docker completo no debe exceder 6 GB RAM (uso en computadora local) |

---

## Sprint 2: Backend — API Base y Persistencia

**Objetivo:** Backend operativo con modelos de datos, PostgreSQL y APIs base.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T2.1 | [ ] | Crear proyecto FastAPI con estructura: `app/`, `routers/`, `models/`, `services/`, `config/` |
| T2.2 | [ ] | Configurar SQLAlchemy + Alembic para PostgreSQL |
| T2.3 | [ ] | Definir modelo `Conversation` (id, title, created_at, updated_at) |
| T2.4 | [ ] | Definir modelo `Message` (id, conversation_id, role, content, created_at) |
| T2.5 | [ ] | Definir modelo `Source` (id, conversation_id, filename, file_type, file_path, created_at) |
| T2.6 | [ ] | Crear migraciones iniciales |
| T2.7 | [ ] | Implementar configuración desde variables de entorno (Pydantic Settings) |
| T2.8 | [ ] | Endpoint de health check: `GET /health` |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F2.1 | [ ] | `POST /conversations` — Crear conversación |
| F2.2 | [ ] | `GET /conversations` — Listar conversaciones (ordenadas por fecha) |
| F2.3 | [ ] | `GET /conversations/{id}` — Obtener conversación con mensajes y fuentes |
| F2.4 | [ ] | `DELETE /conversations/{id}` — Eliminar conversación |
| F2.5 | [ ] | Mensajes asociados a conversación deben persistirse |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF2.1 | [ ] | API debe responder en < 200ms para operaciones CRUD |
| NF2.2 | [ ] | Manejo de errores con respuestas JSON estructuradas |
| NF2.3 | [ ] | CORS configurado para el frontend Angular |

---

## Sprint 3: Procesamiento de Documentos y Embeddings

**Objetivo:** Carga de documentos, extracción de texto, chunking y almacenamiento en Qdrant.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T3.1 | [ ] | Integrar LangChain o implementación directa de document loaders |
| T3.2 | [ ] | Implementar loaders: PDF (pypdf), TXT, Markdown, DOCX (python-docx), Excel (openpyxl), PowerPoint (python-pptx) |
| T3.3 | [ ] | Implementar loader para URLs web (requests + BeautifulSoup) |
| T3.4 | [ ] | Definir estrategia de chunking (tamaño ~500-1000 tokens, overlap configurable) |
| T3.5 | [ ] | Integrar Ollama para embeddings (`nomic-embed-text` por defecto) |
| T3.6 | [ ] | Configurar cliente Qdrant: crear colecciones por conversación o namespaces |
| T3.7 | [ ] | Almacenar vectores con metadata: `conversation_id`, `source_id`, `chunk_index` |
| T3.8 | [ ] | API de subida de archivos con validación de tipos y tamaño |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F3.1 | [ ] | `POST /conversations/{id}/sources/upload` — Subir uno o varios archivos |
| F3.2 | [ ] | `POST /conversations/{id}/sources/upload-folder` — Subir contenido de carpeta |
| F3.3 | [ ] | `GET /conversations/{id}/sources` — Listar fuentes anexadas |
| F3.4 | [ ] | `DELETE /conversations/{id}/sources/{source_id}` — Eliminar fuente y sus vectores |
| F3.5 | [ ] | Al subir archivo: extraer texto → chunkear → generar embeddings → guardar en Qdrant |
| F3.6 | [ ] | Soporte para: PDF, MD, TXT, DOCX, Excel, PowerPoint, URLs web |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF3.1 | [ ] | Límite de tamaño por archivo (ej. 20MB) |
| NF3.2 | [ ] | Límite de archivos por conversación (ej. 50) |
| NF3.3 | [ ] | Procesamiento asíncrono o en background para archivos grandes |
| NF3.4 | [ ] | Validación estricta de tipos MIME |

---

## Sprint 4: Pipeline RAG y LLM

**Objetivo:** Pipeline RAG completo: búsqueda semántica, contexto y generación con Ollama.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T4.1 | [ ] | Implementar búsqueda por similitud en Qdrant (top-k configurable, ej. 5-10 chunks) |
| T4.2 | [ ] | Construir prompt con: system prompt + contexto (chunks relevantes) + historial reciente + pregunta |
| T4.3 | [ ] | Integrar Ollama para generación (modelo configurable vía `OLLAMA_MODEL`, default `llama3.2:3b`) |
| T4.4 | [ ] | Implementar streaming de respuesta (Server-Sent Events - SSE) |
| T4.5 | [ ] | Persistir mensajes (user + assistant) en PostgreSQL tras completar respuesta |
| T4.6 | [ ] | Manejar caso sin fuentes: responder indicando que se deben anexar fuentes |
| T4.7 | [ ] | Incluir citas/fuentes en metadata de respuesta (opcional, chunks usados) |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F4.1 | [ ] | `POST /conversations/{id}/chat` — Enviar pregunta, recibir respuesta (JSON con texto completo) |
| F4.2 | [ ] | `POST /conversations/{id}/chat/stream` — Enviar pregunta, recibir SSE con chunks de texto |
| F4.3 | [ ] | Respuesta basada únicamente en fuentes anexadas a la conversación |
| F4.4 | [ ] | Historial de mensajes de la conversación incluido en contexto del LLM (ventana N últimos) |
| F4.5 | [ ] | Si no hay fuentes: respuesta amigable pidiendo anexar documentos |
| F4.6 | [ ] | Respuesta final completa disponible al finalizar streaming |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF4.1 | [ ] | Latencia de primera respuesta (TTFT) < 5 segundos |
| NF4.2 | [ ] | Streaming fluido (chunks cada ~50-200ms) |
| NF4.3 | [ ] | Timeout configurable para llamadas a Ollama |

---

## Sprint 5: Frontend — Angular y UI de Chat

**Objetivo:** Interfaz Angular con estética synthwave, lista de conversaciones, chat y subida de archivos.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T5.1 | [ ] | Crear proyecto Angular (standalone components, routing) |
| T5.2 | [ ] | Definir diseño synthwave: paleta (púrpura, rosa, cian, neón), tipografía, variables CSS |
| T5.3 | [ ] | Implementar servicio HTTP para API backend |
| T5.4 | [ ] | Implementar servicio de streaming (EventSource/SSE) |
| T5.5 | [ ] | Componente de lista de conversaciones (sidebar o panel) |
| T5.6 | [ ] | Componente de chat: área de mensajes, input, indicador de typing/streaming |
| T5.7 | [ ] | Componente de subida: selector de archivos + selector de carpeta |
| T5.8 | [ ] | Componente de fuentes anexadas (listar, eliminar) |
| T5.9 | [ ] | Responsive básico (desktop first) |
| T5.10 | [ ] | Proxy o configuración CORS para desarrollo local |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F5.1 | [ ] | Pantalla principal: lista de conversaciones a la izquierda, chat a la derecha |
| F5.2 | [ ] | Crear nueva conversación con un clic |
| F5.3 | [ ] | Seleccionar conversación para ver historial y continuar chat |
| F5.4 | [ ] | Subir archivos individuales (drag & drop o selector) |
| F5.5 | [ ] | Subir carpeta completa (selector de directorio) |
| F5.6 | [ ] | Mostrar lista de fuentes anexadas por conversación |
| F5.7 | [ ] | Eliminar fuente desde la UI |
| F5.8 | [ ] | Enviar mensaje y ver respuesta en streaming (texto apareciendo poco a poco) |
| F5.9 | [ ] | Mostrar respuesta final completa al terminar streaming |
| F5.10 | [ ] | Historial de mensajes visible al abrir conversación |
| F5.11 | [ ] | Estética synthwave: gradientes, neón, look moderno/retro-futurista |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF5.1 | [ ] | UI accesible (contraste, focus visible) |
| NF5.2 | [ ] | Feedback visual en acciones (loading, éxito, error) |
| NF5.3 | [ ] | Sin dependencias innecesarias (bundle size razonable) |

---

## Sprint 6: Integración, Pruebas y Documentación

**Objetivo:** Integración end-to-end, validación y documentación para despliegue.

### Requerimientos Técnicos

| ID | ✓ | Requerimiento |
|----|---|---------------|
| T6.1 | [ ] | Integrar backend + frontend en `docker-compose` (orquestación completa) |
| T6.2 | [ ] | Script o instrucciones para descargar modelo Ollama (`ollama pull llama3.2:3b`, `nomic-embed-text`) |
| T6.3 | [ ] | Script de inicialización (migraciones DB, colección Qdrant) |
| T6.4 | [ ] | Pruebas E2E básicas o checklist manual de flujos críticos |
| T6.5 | [ ] | Logging estructurado en backend |
| T6.6 | [ ] | Manejo de errores de red en frontend (reintentos, mensajes claros) |

### Requerimientos Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| F6.1 | [ ] | Flujo completo: crear conversación → subir PDF → hacer pregunta → recibir respuesta con streaming |
| F6.2 | [ ] | Flujo de carga masiva: subir carpeta → ver fuentes → hacer pregunta |
| F6.3 | [ ] | Persistencia: cerrar navegador, volver, ver conversaciones y historial |
| F6.4 | [ ] | Documentación: README con requisitos, instalación, variables de entorno |
| F6.5 | [ ] | Documentación: ejemplos de uso con `docker-compose` |

### Requerimientos No Funcionales

| ID | ✓ | Requerimiento |
|----|---|---------------|
| NF6.1 | [ ] | Proyecto ejecutable con `docker-compose up --build` |
| NF6.2 | [ ] | Sin secretos hardcodeados |
| NF6.3 | [ ] | Licencia open source clara (README + LICENSE) |

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
