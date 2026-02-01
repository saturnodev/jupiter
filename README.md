# Jupiter

**Chatbot RAG local tipo NotebookLM** — Proyecto open source para que la comunidad pueda usar en sus propios servidores de manera libre.

---

## Resumen del Proyecto

Jupiter es un chatbot que usa **RAG** (Retrieval Augmented Generation) y un modelo **Ollama** local para crear notebooks similares a NotebookLM, pero ejecutándose en tu propia infraestructura. Cada conversación funciona como un "notebook" donde puedes anexar fuentes y el RAG responde preguntas basándose únicamente en ellas.

---

## Visión y Alcance (v1 MVP)

| Aspecto | Decisión |
|---------|----------|
| **Licencia** | Open source, compartir con la comunidad |
| **Uso** | Personal — una persona por despliegue (máquina local o servidor) |
| **Despliegue** | Docker o stack de servicios en servidor |

---

## Funcionalidad v1 MVP

- ✅ **Conversaciones (notebooks)** — Abrir y gestionar conversaciones
- ✅ **Anexar fuentes** por conversación — Subir archivos o cargar carpeta completa
- ✅ **RAG** — Responder preguntas basándose en las fuentes anexadas
- ✅ **Streaming** — Respuestas mostrando texto poco a poco, con respuesta final completa al terminar
- ✅ **Historial persistente** — Ver conversaciones anteriores al volver
- ❌ **Exportación** — Fuera del alcance v1 (Markdown, PDF, JSON en futuras versiones)

---

## Formatos de Fuentes Soportados

- PDF
- Markdown (.md)
- TXT
- Web (links)
- DOCX
- Excel
- PowerPoint

---

## Gestión de Documentos

Por cada conversación (notebook):

1. **Carga individual** — Seleccionar archivos de los tipos soportados
2. **Carga masiva** — Seleccionar carpeta para subir todo su contenido

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Angular |
| **Backend** | Python + FastAPI |
| **Comunicación** | HTTP/REST (WebSockets para streaming) |
| **LLM** | Ollama (local) |
| **Embeddings** | Modelo local con Ollama (ej. `nomic-embed-text`) |
| **Vector Store** | Qdrant |
| **Base de datos** | PostgreSQL (conversaciones, mensajes, metadatos) |

---

## Modelo Ollama

- **Variable de entorno:** `OLLAMA_MODEL`
- **Valor por defecto:** `llama3.2:3b` (modelo ligero pero suficiente para RAG)

---

## Infraestructura

- **Dockerización** — Toda la solución desplegable con Docker
- **Configuración** — Variables de entorno (Docker toma estas variables para montar los servicios)
- **Requisito de RAM** — El stack completo (todos los contenedores) no debe exceder **6 GB de RAM** para ejecución en computadora local

### Servicios Docker

- Backend (FastAPI)
- Frontend (Angular)
- Ollama
- Qdrant
- PostgreSQL

---

## Interfaz de Usuario

- Interfaz de chat similar a **ChatGPT** pero más moderna
- Estética **synthwave** — Colores neón, gradientes púrpura/rosa/cian, look retro-futurista

---

## Arquitectura (Referencia)

```
[Usuario] → [Angular] → [FastAPI] → [Ollama] (LLM + Embeddings)
                ↓              ↓
           [PostgreSQL]   [Qdrant]
           (conversaciones,   (vectores de
            mensajes)         documentos)
```

---

## Próximos Pasos

1. Definir estructura de carpetas del proyecto
2. Configurar `docker-compose` con los servicios
3. Desarrollar backend (APIs, loaders de documentos, pipeline RAG)
4. Desarrollar frontend Angular (chat, subida de archivos)
5. Integrar streaming de respuestas
6. Documentar variables de entorno necesarias
