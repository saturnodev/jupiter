# Jupiter

**Chatbot RAG local tipo NotebookLM** — Proyecto open source para que la comunidad pueda usar en sus propios servidores de manera libre.

---

## Resumen del Proyecto

Jupiter es un chatbot que usa **RAG** (Retrieval Augmented Generation) y un modelo **Ollama** local para crear notebooks similares a NotebookLM, pero ejecutándose en tu propia infraestructura. Cada conversación funciona como un "notebook" donde puedes anexar fuentes y el RAG responde preguntas basándose únicamente en ellas.

---

## Instalación

### Requisitos previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2 o superior)
- ~6 GB RAM libre (el stack está limitado a ~6 GB total)

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone <url-repositorio>
   cd jupiter
   ```

2. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Opcionalmente edita `.env` para ajustar valores (contraseñas, puertos, etc.).

3. **Iniciar el stack**

   ```bash
   docker-compose up --build
   ```

   O en modo detached: `docker-compose up --build -d`

### URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/health |

### Modelos Ollama

Para que RAG funcione, descarga los modelos tras iniciar el stack:

```bash
./docker/init-ollama.sh
```

O manualmente:

```bash
docker exec jupiter-ollama-1 ollama pull nomic-embed-text
docker exec jupiter-ollama-1 ollama pull llama3.2:3b
```

El nombre del contenedor puede variar (`jupiter-ollama-1` es el típico). Lista contenedores: `docker ps`.

### Variables de entorno

Copia `.env.example` a `.env` y ajusta según necesidad. Ver [.env.example](.env.example) para la lista completa de variables (Ollama, Qdrant, PostgreSQL, límites, etc.). **No versiones `.env`** — contiene secretos; está en `.gitignore`.

### Ejemplos de uso con docker-compose

```bash
# Iniciar en segundo plano
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# Ver modelos Ollama instalados
docker exec jupiter-ollama-1 ollama list

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (borra datos)
docker-compose down -v
```

### Notas

- **Primera ejecución:** Ollama puede tardar más de 60 segundos en arrancar la primera vez al descargar los modelos. Las ejecuciones posteriores serán más rápidas.
- **RAM:** El stack está limitado a ~6 GB total. Ver sección [Infraestructura](#infraestructura).

---

## Verificación E2E

Checklist manual de flujos críticos: [docs/E2E_CHECKLIST.md](docs/E2E_CHECKLIST.md)

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

## Licencia

Jupiter es open source bajo la [Apache License 2.0](LICENSE).
