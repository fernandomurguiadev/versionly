# Versionly — Plan de Desarrollo (MVP)
**Versión 1.0 · Febrero 2026**

---

## 1. Orden de desarrollo Backend (core → menor impacto)
1) Fundaciones del proyecto: NestJS, configuración, validaciones, auth base.
2) Módulo de usuarios y workspaces: membresías, roles y permisos.
3) Estructura de organización: proyectos, carpetas y documentos.
4) Versionado: guardado de versiones, Versión Actual, historial.
5) Borrador activo: autoguardado y recuperación.
6) Compartir: links fijos/dinámicos y control de acceso.
7) Comparación: endpoint de diff y datos de resumen.
8) Notificaciones: SSE y eventos relevantes.
9) Importación: pipeline `.docx` a formato interno.
10) Auditoría mínima: logs de acciones críticas.

### Backend v1.1 — Google Drive Integration
1. Configurar OAuth2 credentials en Google Cloud Console.
2. Módulo `integrations/google-drive/` — `GoogleDriveService`, `DriveAuthService`.
3. Migraciones: tablas `drive_connections` y `drive_file_mappings`.
4. Endpoints: `POST /integrations/google/authorize`, `/callback`, `/revoke`, `GET /files`, `GET /files/:id`.
5. Extender imports: `POST /folders/:id/imports/google-drive`.
6. Eventos de notificación: `drive.import.completed`, `drive.token.expired`.

---

## 2. Orden de desarrollo Frontend (core → menor impacto)
1) Fundaciones de app: routing, layout base, autenticación.
2) Workspace y navegación: selector de workspace, proyectos y carpetas.
3) Documentos: listado, creación y permisos.
4) Editor con borrador activo: contenteditable con HTML + autoguardado.
5) Versionado: guardado, historial y Versión Actual.
6) Comparación: vista diff y navegación por cambios.
7) Compartir: generación de links y vista pública.
8) Notificaciones: feed in-app con SSE.
9) Importación: carga de `.docx` y feedback de warnings.
10) Refinamiento UX: estados vacíos, errores y permisos.

### Frontend v1.1 — Google Drive Integration
1. Página callback OAuth: `app/integrations/google-drive/callback/page.tsx`.
2. Hook `use-drive-connection` + `use-drive-files` (TanStack Query).
3. Componente `DriveFilePicker` modal.
4. Extender modal de imports: tab "Desde Google Drive".
5. Página `settings/connected-accounts`.

**Estado actual del editor (frontend):** autoguardado activo, formato básico y fase 2 parcial (listas, enlaces, imágenes, tablas, márgenes, interlineado y espaciado de párrafos).
