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

## 15. Parámetros estándar de listado
- `q`: búsqueda por nombre/título (FULLTEXT).
- `page`: número de página (default 1).
- `limit`: tamaño de página (default 20).
- `sortBy`: campo de orden (createdAt, updatedAt, name, title).
- `sortOrder`: `asc` o `desc`.
