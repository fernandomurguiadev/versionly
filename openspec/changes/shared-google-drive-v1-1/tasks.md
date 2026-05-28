# Tasks: shared-google-drive-v1-1

**Última actualización:** 2026-05-28

---

## Fase 1 — Backend: entidades y módulo

- [ ] Agregar modelos Prisma `DriveConnection` y `DriveFileMapping` al `schema.prisma`
- [ ] Avisar al usuario: `npx prisma migrate dev --name add-drive-integration`
- [ ] Crear `api/src/modules/integrations/google-drive/` con estructura completa
- [ ] Crear `DriveEncryptionService` (AES-256-GCM para tokens)
- [ ] Instalar `googleapis` v120+, `google-auth-library` v9+, `passport-google-oauth20` v2.0

## Fase 2 — Backend: endpoints OAuth y archivos

- [ ] `GET /integrations/google-drive/authorize` — genera URL de consent y redirige
- [ ] `GET /integrations/google-drive/callback` — recibe code, intercambia por tokens, cifra y guarda
- [ ] `DELETE /integrations/google-drive/revoke` — revoca en Google + borra de DB
- [ ] `GET /integrations/google-drive/files` — lista archivos (requiere conexión activa)
- [ ] `GET /workspaces/:wsId/drive-status` — `{ connected: boolean }` sin exponer tokens

## Fase 3 — Backend: importación

- [ ] `POST /documents/:docId/imports/google-drive` — descarga archivo, convierte con mammoth.js, crea versión
- [ ] Manejo de token expirado: refresh automático antes de la llamada a Drive API
- [ ] Manejo de archivo eliminado de Drive: error amigable, sin romper el documento

## Fase 4 — Frontend: API hooks y componentes

- [ ] `src/lib/api/drive.ts` — funciones para todos los endpoints de Drive
- [ ] `src/lib/hooks/use-drive.ts` — `useDriveStatus`, `useDriveFiles`, `useConnectDrive`, `useRevokeDrive`, `useImportFromDrive`
- [ ] `src/app/(app)/(features)/integrations/google-drive/callback/page.tsx`
- [ ] `drive-connect-button.tsx` — botón condicional (conectar / desconectado)
- [ ] `drive-file-picker.tsx` — modal con lista paginada y búsqueda
- [ ] `drive-status-badge.tsx` — badge de estado de conexión

## Fase 5 — Frontend: integración en pantallas existentes

- [ ] Página `imports/page.tsx` — tab "Desde Google Drive" con `DriveFilePicker` o `DriveConnectButton` si no hay conexión
- [ ] Settings `connected-accounts/page.tsx` — muestra DriveConnection activa con opción de revocar
- [ ] Editor: botón "Importar desde Drive" en el menú del documento (usa `useImportFromDrive`)

## Fase 6 — Feature flag y env vars

- [ ] Si `GOOGLE_CLIENT_ID` no está en `.env`, el módulo de Drive se omite sin errores
- [ ] Agregar a `api/.env.example`: `GOOGLE_CLIENT_ID=`, `GOOGLE_CLIENT_SECRET=`, `DRIVE_TOKEN_ENCRYPTION_KEY=`, `GOOGLE_CALLBACK_URL=`
- [ ] Documentar en `openspec/project-rules.md` cómo habilitar Drive

## Fase 7 — Verificación

- [ ] `npm run typecheck` en api/ sin errores
- [ ] `npm run typecheck` en app/ sin errores
- [ ] Con `GOOGLE_CLIENT_ID` vacío: la app arranca normalmente, sin errores de módulo Drive
- [ ] Con Drive conectado: el picker funciona y la importación crea una versión

---

## Deuda técnica generada

- Watch API de Google Drive (push notifications en lugar de polling) → v2.0
- Sync automático de versiones → v2.0 (fuera del MVP y v1.1 intencional)
