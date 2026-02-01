# Jupiter — Checklist E2E

Checklist manual para validar los flujos críticos del proyecto Jupiter tras ejecutar `docker-compose up --build`.

## Precondiciones

- [ ] `cp .env.example .env` ejecutado
- [ ] `docker-compose up --build` completado sin errores
- [ ] Acceso por **http://localhost:4200** (no usar puerto 80 ni URL incorrecta)
- [ ] Modelos Ollama descargados: `./docker/init-ollama.sh`
- [ ] Backend health OK: `curl http://localhost:8000/health` → `{"status":"ok"}`
- [ ] Frontend accesible: abrir http://localhost:4200

---

## F6.1 — Flujo completo (crear conversación → subir PDF → pregunta → streaming)

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Abrir http://localhost:4200 | Carga la interfaz Jupiter |
| 2 | Clic en "Nueva conversación" | Se crea conversación, aparece en sidebar y chat vacío |
| 3 | Subir un archivo PDF (clic en "Add Source" o drag & drop) | El PDF aparece en la lista de fuentes con badge "Indexed" |
| 4 | Escribir una pregunta sobre el contenido del PDF y enviar | Aparece indicador "Escribiendo...", luego respuesta en streaming |
| 5 | Esperar a que termine la respuesta | Respuesta completa visible, mensaje user y assistant en historial |
| 6 | Verificar historial | Al recargar o volver a la conversación, se ven los mensajes |

---

## F6.2 — Flujo de carga masiva (subir carpeta → ver fuentes → pregunta)

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Crear nueva conversación | Conversación activa |
| 2 | Usar "Subir carpeta" para seleccionar directorio con varios archivos (PDF, TXT, MD, etc.) | Todos los archivos se suben y aparecen en Source Library |
| 3 | Verificar lista de fuentes | Cada archivo con badge "Indexed" |
| 4 | Escribir pregunta sobre el contenido de los archivos y enviar | Respuesta basada en las fuentes subidas |

---

## F6.3 — Persistencia (cerrar navegador, volver, ver historial)

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Tener una conversación con mensajes (tras F6.1 o F6.2) | Conversación con historial |
| 2 | Cerrar el navegador por completo | - |
| 3 | Volver a abrir http://localhost:4200 | Interfaz carga |
| 4 | Verificar que la conversación sigue en la lista | Misma conversación visible en sidebar |
| 5 | Seleccionar la conversación | Historial de mensajes visible (user y assistant) |

---

## Comandos útiles durante la validación

```bash
# Ver logs del backend
docker-compose logs -f backend

# Verificar modelos Ollama
docker exec jupiter-ollama-1 ollama list

# Health del backend
curl http://localhost:8000/health
```

---

## Notas

- La primera ejecución puede tardar más por descarga de modelos Ollama.
- Si el chat no responde o da error, verificar que `nomic-embed-text` y `llama3.2:3b` estén instalados.
- Si la subida falla, revisar límites en `.env` (MAX_FILE_SIZE_MB, MAX_FILES_PER_CONVERSATION).
