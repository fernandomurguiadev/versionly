# Versionly — Contrato Base de API (MVP)
**Versión 1.1 · Febrero 2026**

---

## 1. Autenticación
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`
- POST `/api/v1/auth/verify-email`
- POST `/api/v1/auth/resend-verification`
- POST `/api/v1/auth/forgot-password`
- POST `/api/v1/auth/reset-password`

## 2. Usuarios
- GET `/api/v1/users/me`
- PATCH `/api/v1/users/me`
- PATCH `/api/v1/users/me/password`
- DELETE `/api/v1/users/me/sessions`

## 3. Workspaces y miembros
- GET `/api/v1/workspaces`
- POST `/api/v1/workspaces`
- GET `/api/v1/workspaces/{wsId}`
- PATCH `/api/v1/workspaces/{wsId}`
- DELETE `/api/v1/workspaces/{wsId}`
- GET `/api/v1/workspaces/{wsId}/members`
- POST `/api/v1/workspaces/{wsId}/members`
- PATCH `/api/v1/workspaces/{wsId}/members/{userId}`
- DELETE `/api/v1/workspaces/{wsId}/members/{userId}`
- GET `/api/v1/workspaces/{wsId}/activity`

## 4. Invitaciones
- POST `/api/v1/workspaces/{wsId}/invitations`
- GET `/api/v1/invitations/{token}`
- POST `/api/v1/invitations/{token}/accept`
- DELETE `/api/v1/workspaces/{wsId}/invitations/{id}`

## 5. Proyectos y carpetas
- GET `/api/v1/workspaces/{wsId}/projects`
- POST `/api/v1/workspaces/{wsId}/projects`
- GET `/api/v1/projects/{projectId}`
- PATCH `/api/v1/projects/{projectId}`
- DELETE `/api/v1/projects/{projectId}`
- GET `/api/v1/projects/{projectId}/folders`
- POST `/api/v1/projects/{projectId}/folders`
- GET `/api/v1/folders/{folderId}`
- PATCH `/api/v1/folders/{folderId}`
- DELETE `/api/v1/folders/{folderId}`

## 6. Documentos y miembros
- GET `/api/v1/folders/{folderId}/documents`
- POST `/api/v1/folders/{folderId}/documents`
- GET `/api/v1/documents/{docId}`
- PATCH `/api/v1/documents/{docId}`
- DELETE `/api/v1/documents/{docId}`
- GET `/api/v1/documents/{docId}/members`
- POST `/api/v1/documents/{docId}/members`
- PATCH `/api/v1/documents/{docId}/members/{userId}`
- DELETE `/api/v1/documents/{docId}/members/{userId}`
- PATCH `/api/v1/documents/{docId}/move`

## 7. Assets (imágenes)
- POST `/api/v1/documents/{docId}/assets`
- GET `/api/v1/documents/{docId}/assets`
- DELETE `/api/v1/assets/{assetId}`

## 8. Borradores
- GET `/api/v1/documents/{docId}/draft`
- PUT `/api/v1/documents/{docId}/draft`

## 9. Versiones
- GET `/api/v1/documents/{docId}/versions`
- POST `/api/v1/documents/{docId}/versions`
- GET `/api/v1/versions/{versionId}`
- DELETE `/api/v1/versions/{versionId}`
- POST `/api/v1/versions/{versionId}/set-current`

## 10. Comparación y merge
- GET `/api/v1/diff?versionA={id}&versionB={id}`
- GET `/api/v1/documents/{docId}/conflicts`
- POST `/api/v1/documents/{docId}/merge`

## 11. Compartir
- POST `/api/v1/documents/{docId}/shares`
- GET `/api/v1/documents/{docId}/shares`
- DELETE `/api/v1/shares/{shareId}`
- GET `/api/v1/public/{token}`

## 12. Notificaciones
- GET `/api/v1/notifications`
- PATCH `/api/v1/notifications/{id}/read`
- PATCH `/api/v1/notifications/read-all`
- GET `/api/v1/notifications/stream` (SSE)

## 13. Importaciones
- POST `/api/v1/folders/{folderId}/imports`

## 14. Health
- GET `/api/v1/health`

---

## 15. Google Drive Integration (v1.1)

### 15.1 Auth OAuth2

#### `GET /api/v1/integrations/google/authorize`
Inicia el flujo OAuth2. Redirige al consent screen de Google con los scopes requeridos.

**Scopes solicitados:** `drive.readonly`, `drive.metadata.readonly`, `userinfo.email`, `userinfo.profile`

**Query params opcionales:**
| Param | Tipo | Descripción |
|---|---|---|
| `workspaceId` | string (UUID) | Workspace al que asociar la conexión |

**Respuesta:** HTTP 302 redirect a `https://accounts.google.com/o/oauth2/v2/auth?...`

---

#### `GET /api/v1/integrations/google/callback`
Manejado internamente por Passport. Google redirige aquí con el código de autorización. El backend intercambia el código por tokens, crea o actualiza el `DriveConnection`, y retorna al frontend con un JWT.

**Query params (enviados por Google):**
| Param | Tipo | Descripción |
|---|---|---|
| `code` | string | Código de autorización de Google |
| `state` | string | CSRF token generado en `/authorize` |
| `error` | string | Presente si el usuario denegó acceso |

**Respuesta exitosa:** HTTP 302 redirect al frontend con token en query param o cookie.

**Respuesta de error (acceso denegado):**
```json
{ "error": "access_denied", "message": "El usuario denegó el acceso a Google Drive." }
```

---

#### `DELETE /api/v1/integrations/google/revoke`
Revoca los tokens OAuth2 en Google y elimina el registro `DriveConnection` del usuario en el workspace actual.

**Headers:** `Authorization: Bearer <jwt>`

**Respuesta exitosa:** HTTP 204 No Content

**Respuesta de error:**
```json
{ "statusCode": 404, "message": "No existe una conexión de Google Drive activa para este workspace." }
```

---

### 15.2 Drive Files

#### `GET /api/v1/integrations/google/files`
Lista archivos `.docx` y Google Docs del usuario autenticado en Google Drive. Requiere `DriveConnection` activa.

**Headers:** `Authorization: Bearer <jwt>`

**Query params:**
| Param | Tipo | Descripción |
|---|---|---|
| `pageToken` | string | Token de paginación de Google Drive API |
| `q` | string | Query de búsqueda (nombre del archivo) |

**Respuesta exitosa:** HTTP 200
```json
{
  "files": [
    {
      "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
      "name": "Informe Q1 2026.docx",
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "webViewLink": "https://drive.google.com/file/d/.../view",
      "modifiedTime": "2026-03-15T10:30:00Z"
    },
    {
      "id": "1uktNJnlJM_v5OJuJMc0k0jLUPxh7M0Qr",
      "name": "Propuesta Proyecto Alpha",
      "mimeType": "application/vnd.google-apps.document",
      "webViewLink": "https://docs.google.com/document/d/.../edit",
      "modifiedTime": "2026-03-14T08:15:00Z"
    }
  ],
  "nextPageToken": "~!!~AI9FV7Tg..."
}
```

**Respuesta de error (sin conexión activa):**
```json
{ "statusCode": 401, "message": "No hay una conexión de Google Drive activa. Conecte su cuenta primero." }
```

---

#### `GET /api/v1/integrations/google/files/:fileId`
Retorna metadata de un archivo específico de Google Drive.

**Headers:** `Authorization: Bearer <jwt>`

**Path params:**
| Param | Tipo | Descripción |
|---|---|---|
| `fileId` | string | ID del archivo en Google Drive |

**Respuesta exitosa:** HTTP 200
```json
{
  "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
  "name": "Informe Q1 2026.docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "webViewLink": "https://drive.google.com/file/d/.../view",
  "modifiedTime": "2026-03-15T10:30:00Z",
  "size": "45312"
}
```

---

### 15.3 Import from Drive

#### `POST /api/v1/folders/:folderId/imports/google-drive`
Importa un archivo de Google Drive como nueva versión de un documento Versionly. El usuario selecciona el archivo explícitamente (no hay auto-sync). Si `targetDocumentId` se omite, se crea un nuevo documento.

**Headers:** `Authorization: Bearer <jwt>`

**Path params:**
| Param | Tipo | Descripción |
|---|---|---|
| `folderId` | string (UUID) | Carpeta destino del documento |

**Body:**
```json
{
  "googleFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
  "title": "Informe Q1 2026",
  "targetDocumentId": "uuid-opcional-si-crea-nueva-version-en-doc-existente"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `googleFileId` | string | Sí | ID del archivo en Google Drive |
| `title` | string | No | Título del documento en Versionly (default: nombre del archivo en Drive) |
| `targetDocumentId` | string (UUID) | No | Si se omite, se crea un nuevo documento |

**Respuesta exitosa:** HTTP 201
```json
{
  "documentId": "uuid-documento-versionly",
  "versionId": "uuid-version-creada",
  "warnings": [
    "Se omitieron 2 imágenes embebidas no soportadas.",
    "El formato de tabla compleja fue simplificado."
  ],
  "driveMetadata": {
    "googleFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    "fileName": "Informe Q1 2026.docx",
    "webViewLink": "https://drive.google.com/file/d/.../view",
    "importedAt": "2026-03-15T12:00:00Z"
  }
}
```

**Respuesta de error (archivo no accesible):**
```json
{
  "statusCode": 403,
  "message": "El archivo de Google Drive no es accesible con los permisos actuales."
}
```

---

### 15.4 Sync Status

#### `GET /api/v1/integrations/google/connections`
Retorna el estado de la conexión OAuth del usuario para el workspace actual.

**Headers:** `Authorization: Bearer <jwt>`

**Respuesta (con conexión activa):** HTTP 200
```json
{
  "connected": true,
  "googleEmail": "usuario@gmail.com",
  "connectedAt": "2026-03-01T09:00:00Z",
  "scopes": [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ],
  "tokenExpiresAt": "2026-03-15T13:00:00Z"
}
```

**Respuesta (sin conexión):** HTTP 200
```json
{
  "connected": false
}
```

---

## 16. Parámetros estándar de listado
- `q`: búsqueda por nombre/título (FULLTEXT).
- `page`: número de página (default 1).
- `limit`: tamaño de página (default 20).
- `sortBy`: campo de orden (createdAt, updatedAt, name, title).
- `sortOrder`: `asc` o `desc`.
