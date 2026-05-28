# Change: shared-google-drive-v1-1

**Scope:** `api/` + `app/` (shared)
**Agente responsable:** Backend Agent + Frontend Agent
**Versión del producto:** v1.1
**Estado:** proposed
**Fecha:** 2026-05-28

---

## Principio rector

> Google Drive es un **canal de importación adicional, completamente opcional**.
> Si el usuario nunca conecta Drive, la app funciona exactamente igual que en v1.0.
> No hay dependencias en tiempo de ejecución con Google APIs fuera del flujo de OAuth.

---

## Funcionalidad

### Lo que agrega v1.1
| Feature | Descripción |
|---|---|
| Conectar cuenta Drive | OAuth2 con `drive.readonly` + `drive.metadata.readonly`. Admin del workspace. |
| Importar desde Drive | Usuario abre picker, elige un archivo, Versionly lo importa como nueva versión del documento. |
| Revocar acceso | Desconecta el token, no elimina versiones ya importadas. |
| Indicador de conexión | Settings muestra si Drive está conectado o no. Sin Drive = empty state claro. |

### Lo que NO hace v1.1
- No hay sync automático ni polling.
- No hay Watch API de Google (eso es v2.0).
- No bloquea ninguna funcionalidad si Drive no está conectado.

---

## Modo offline / sin Drive

El frontend detecta si hay una `DriveConnection` activa para el workspace:
- **Sin conexión**: el botón "Importar desde Drive" muestra un tooltip "Conectar Google Drive primero". Las demás funciones (importar desde .docx, crear versión manual, etc.) siguen funcionando normalmente.
- **Con conexión**: aparece el Drive File Picker modal.
- La detección es lazy (solo se consulta cuando el usuario abre el panel de importaciones).

---

## Backend — Módulo `integrations/google-drive`

### Nuevas entidades (Prisma)
```
DriveConnection: id, userId, workspaceId, accessTokenEnc, refreshTokenEnc, expiresAt, createdAt
DriveFileMapping: id, documentId, driveFileId, driveFileName, driveFileMimeType, driveConnectionId, lastImportedAt
```

### Endpoints
| Método | Path | Descripción |
|---|---|---|
| GET | `/integrations/google-drive/authorize` | Redirect OAuth2 a Google |
| GET | `/integrations/google-drive/callback` | Callback OAuth2, guarda tokens cifrados |
| DELETE | `/integrations/google-drive/revoke` | Revoca y elimina tokens |
| GET | `/integrations/google-drive/files` | Lista archivos del Drive del usuario |
| POST | `/documents/:docId/imports/google-drive` | Importa un archivo de Drive como nueva versión |
| GET | `/workspaces/:wsId/drive-status` | `{ connected: boolean }` — sin exposer tokens |

### Decisiones de seguridad
- `accessToken` y `refreshToken` se almacenan cifrados con AES-256-GCM.
- La clave de cifrado viene de `DRIVE_TOKEN_ENCRYPTION_KEY` en `.env`.
- El frontend nunca recibe tokens de Drive.
- Si el token expira, se hace refresh automático en el servidor antes de llamar a Drive API.

---

## Frontend — Estructura

```
src/app/(app)/(features)/integrations/google-drive/
├── callback/page.tsx          ← Server Component: procesa code OAuth, redirige
└── components/
    ├── drive-connect-button.tsx    ← botón "Conectar Drive" (muestra si no hay conexión)
    ├── drive-file-picker.tsx       ← modal con lista de archivos Drive
    └── drive-status-badge.tsx      ← badge "Drive conectado / desconectado"

src/lib/api/drive.ts           ← funciones de API para Drive
src/lib/hooks/use-drive.ts     ← hooks TanStack Query
```

---

## Criterios de aceptación

- [ ] Sin `GOOGLE_CLIENT_ID` en `.env`, el módulo de Drive no se inicializa (feature flag vía env var).
- [ ] Un workspace sin DriveConnection puede usar todas las funciones de Versionly normalmente.
- [ ] El Drive File Picker solo aparece cuando `driveStatus.connected === true`.
- [ ] Revocar la conexión no elimina versiones importadas.
- [ ] Los tokens nunca aparecen en logs ni en respuestas de API.
- [ ] `npm run typecheck` sin errores en api/ y app/.
