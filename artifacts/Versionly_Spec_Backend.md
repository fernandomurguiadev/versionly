# Versionly — Especificación Técnica Backend
**Stack: NestJS 10 · Node.js 22 LTS · MySQL 8.0 · Prisma 5 · Redis 7**
**Metodología: Spec-Driven Development · Versión 1.0 · Febrero 2026**

---

## Índice

1. [Validación y corrección de la estructura propuesta](#1-validación-y-corrección-de-la-estructura-propuesta)
2. [Estructura final corregida](#2-estructura-final-corregida)
3. [Convenciones globales](#3-convenciones-globales)
4. [Contrato de API completo](#4-contrato-de-api-completo)
5. [Especificación por módulo](#5-especificación-por-módulo)
6. [Capas transversales](#6-capas-transversales)
7. [Modelos de datos (DTOs canónicos)](#7-modelos-de-datos-dtos-canónicos)
8. [Reglas de negocio críticas](#8-reglas-de-negocio-críticas)
9. [Testing](#9-testing)

---

## 1. Validación y corrección de la estructura propuesta

### ✅ Lo que está bien

- Separación en `modules/` por dominio funcional es correcta y alineada con la arquitectura NestJS.
- `common/` con `filters`, `guards`, `interceptors`, `pipes` sigue el patrón estándar de NestJS.
- `database/prisma/` como carpeta dedicada es correcto.
- `integrations/` como capa de abstracción para servicios externos es buena práctica.

### ❌ Correcciones necesarias

**1. `database/migrations/` está en el lugar equivocado**
Prisma genera y administra las migraciones en `prisma/migrations/` a nivel raíz del proyecto, no dentro de `src/`. Moverlas adentro del source rompe los comandos de CLI de Prisma.

**2. `integrations/notifications/` duplica `modules/notifications/`**
Las notificaciones son un módulo de dominio (SSE, feed, marca como leído). El transporte SSE debe estar en `integrations/sse/` o directamente dentro del módulo. Separar en dos lugares crea confusión sobre dónde vive la lógica.

**3. Falta el módulo `assets/`**
El schema v1.2 tiene la tabla `document_assets` para imágenes subidas al editor. No hay módulo correspondiente en la estructura.

**4. Falta el módulo `invitations/`**
La tabla `workspace_invitations` y el flujo de invitar usuarios sin cuenta requieren un módulo dedicado (generación de token, validación, aceptación).

**5. Falta el módulo `merge/`**
El flujo de resolución de conflictos (MRG-01/02) tiene lógica de negocio propia que no debe mezclarse con `versions/` ni con `diff/`.

**6. `config/` sin estructura interna definida**
Sin especificar qué archivos van ahí, cada desarrollador lo implementa distinto. Necesita convención explícita.

**7. Falta `health/`**
Un endpoint `/health` es necesario para que Railway/Render detecte que el servidor está operativo.

---

## 2. Estructura final corregida

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── app.config.ts          # puerto, cors, prefijo global
│   │   ├── database.config.ts     # URL de MySQL desde env
│   │   ├── jwt.config.ts          # secret, expiración access/refresh
│   │   ├── redis.config.ts        # host, port, password
│   │   └── storage.config.ts      # R2 bucket, endpoint, keys
│   │
│   ├── common/
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── workspace-role.guard.ts
│   │   │   └── document-role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response-transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── uuid-validation.pipe.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── workspace-roles.decorator.ts
│   │   │   └── document-roles.decorator.ts
│   │   └── types/
│   │       ├── jwt-payload.type.ts
│   │       └── paginated-response.type.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── workspaces/
│   │   ├── invitations/           # [NEW] tokens de invitación
│   │   ├── projects/
│   │   ├── folders/
│   │   ├── documents/
│   │   ├── assets/                # [NEW] imágenes del editor
│   │   ├── drafts/
│   │   ├── versions/
│   │   ├── merge/                 # [NEW] resolución de conflictos
│   │   ├── diff/
│   │   ├── shares/
│   │   ├── notifications/
│   │   ├── imports/
│   │   └── health/                # [NEW] GET /health
│   │
│   └── integrations/
│       ├── prisma/
│       │   └── prisma.service.ts
│       ├── redis/
│       │   └── redis.service.ts
│       ├── storage/
│       │   └── storage.service.ts  # abstracción R2/S3
│       ├── sse/
│       │   └── sse.service.ts      # Server-Sent Events broadcast
│       └── email/
│           └── email.service.ts    # stub MVP — solo log en consola
│
├── test/
│   ├── unit/
│   └── e2e/
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 3. Convenciones globales

### 3.1 Nomenclatura de archivos

```
[dominio].module.ts
[dominio].controller.ts
[dominio].service.ts
[dominio].repository.ts     # solo si hay lógica de query compleja
dto/
  create-[dominio].dto.ts
  update-[dominio].dto.ts
  [dominio]-response.dto.ts
```

### 3.2 Respuesta estándar de la API

Todas las respuestas siguen el mismo envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-02-01T00:00:00Z" }
}
```

Errores:
```json
{
  "success": false,
  "error": {
    "code": "WORKSPACE_NOT_FOUND",
    "message": "El workspace no existe o no tenés acceso.",
    "statusCode": 404
  }
}
```

### 3.3 Prefijo global

Todos los endpoints bajo `/api/v1/`.

### 3.4 Paginación estándar

Parámetros de query: `?page=1&limit=20&sortBy=createdAt&sortOrder=desc`

Respuesta meta:
```json
"meta": {
  "total": 84,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### 3.5 Variables de entorno requeridas

```
# App
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mysql://root:RootPass123!@host:3307/versionly_db

# JWT
JWT_ACCESS_SECRET=accessSecret123!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refreshSecret123!
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Storage (Cloudflare R2)
STORAGE_ENDPOINT=https://<account>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=versionly-assets
STORAGE_PUBLIC_URL=https://assets.versionly.io

# Email (stub MVP)
EMAIL_FROM=noreply@versionly.io
FRONTEND_URL=http://localhost:4201

# App
MAX_IMPORT_FILE_SIZE_MB=10
```

---

## 4. Contrato de API completo

### Auth

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | Registro con email y contraseña |
| POST | `/api/v1/auth/login` | ❌ | Login, retorna access + refresh token |
| POST | `/api/v1/auth/refresh` | ❌ | Renueva access token con refresh token |
| POST | `/api/v1/auth/logout` | ✅ | Revoca refresh token activo |
| POST | `/api/v1/auth/verify-email` | ❌ | Verifica email con token de URL |
| POST | `/api/v1/auth/resend-verification` | ❌ | Reenvía email de verificación |
| POST | `/api/v1/auth/forgot-password` | ❌ | Solicita link de reset |
| POST | `/api/v1/auth/reset-password` | ❌ | Establece nueva contraseña con token |

### Users

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/users/me` | ✅ | Perfil del usuario autenticado |
| PATCH | `/api/v1/users/me` | ✅ | Actualiza full_name |
| PATCH | `/api/v1/users/me/password` | ✅ | Cambia contraseña (requiere contraseña actual) |
| DELETE | `/api/v1/users/me/sessions` | ✅ | Revoca todos los refresh tokens (logout global) |

### Workspaces

| Método | Endpoint | Auth | Rol mínimo | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/workspaces` | ✅ | — | Lista workspaces del usuario |
| POST | `/api/v1/workspaces` | ✅ | — | Crea workspace (el creador queda como Admin) |
| GET | `/api/v1/workspaces/:wsId` | ✅ | viewer | Detalle del workspace |
| PATCH | `/api/v1/workspaces/:wsId` | ✅ | admin | Renombra el workspace |
| DELETE | `/api/v1/workspaces/:wsId` | ✅ | admin | Elimina workspace (con confirmación) |
| GET | `/api/v1/workspaces/:wsId/members` | ✅ | viewer | Lista miembros con roles |
| POST | `/api/v1/workspaces/:wsId/members` | ✅ | admin | Agrega miembro existente con rol |
| PATCH | `/api/v1/workspaces/:wsId/members/:userId` | ✅ | admin | Cambia rol de un miembro |
| DELETE | `/api/v1/workspaces/:wsId/members/:userId` | ✅ | admin | Remueve miembro |
| GET | `/api/v1/workspaces/:wsId/activity` | ✅ | viewer | Actividad reciente (documentos modificados) |

### Invitations

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/workspaces/:wsId/invitations` | ✅ admin | Invita por email (usuario con o sin cuenta) |
| GET | `/api/v1/invitations/:token` | ❌ | Valida token de invitación |
| POST | `/api/v1/invitations/:token/accept` | ✅ | Acepta invitación (usuario debe estar autenticado) |
| DELETE | `/api/v1/workspaces/:wsId/invitations/:id` | ✅ admin | Cancela invitación pendiente |

### Projects

| Método | Endpoint | Auth | Rol mínimo | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/workspaces/:wsId/projects` | ✅ | viewer | Lista proyectos del workspace |
| POST | `/api/v1/workspaces/:wsId/projects` | ✅ | admin | Crea proyecto |
| GET | `/api/v1/projects/:projectId` | ✅ | viewer | Detalle del proyecto |
| PATCH | `/api/v1/projects/:projectId` | ✅ | admin | Renombra proyecto |
| DELETE | `/api/v1/projects/:projectId` | ✅ | admin | Elimina proyecto (cascada) |

### Folders

| Método | Endpoint | Auth | Rol mínimo | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/projects/:projectId/folders` | ✅ | viewer | Lista carpetas del proyecto |
| POST | `/api/v1/projects/:projectId/folders` | ✅ | editor | Crea carpeta |
| GET | `/api/v1/folders/:folderId` | ✅ | viewer | Detalle de la carpeta |
| PATCH | `/api/v1/folders/:folderId` | ✅ | editor | Renombra carpeta |
| DELETE | `/api/v1/folders/:folderId` | ✅ | admin | Elimina carpeta (cascada) |

### Documents

| Método | Endpoint | Auth | Rol mínimo | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/folders/:folderId/documents` | ✅ | viewer | Lista documentos con Versión Actual info |
| POST | `/api/v1/folders/:folderId/documents` | ✅ | editor | Crea documento vacío |
| GET | `/api/v1/documents/:docId` | ✅ | viewer | Detalle del documento + Versión Actual |
| PATCH | `/api/v1/documents/:docId` | ✅ | editor | Renombra documento |
| DELETE | `/api/v1/documents/:docId` | ✅ | admin | Elimina documento (con `?confirm=true`) |
| GET | `/api/v1/documents/:docId/members` | ✅ | editor | Lista accesos al documento |
| POST | `/api/v1/documents/:docId/members` | ✅ | editor | Da acceso de Viewer a un usuario |
| PATCH | `/api/v1/documents/:docId/members/:userId` | ✅ | editor | Actualiza can_view_history |
| DELETE | `/api/v1/documents/:docId/members/:userId` | ✅ | editor | Revoca acceso al documento |
| PATCH | `/api/v1/documents/:docId/move` | ✅ | editor | Mueve documento a otra carpeta |

### Assets (imágenes del editor)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/documents/:docId/assets` | ✅ editor | Sube imagen, retorna URL pública |
| GET | `/api/v1/documents/:docId/assets` | ✅ viewer | Lista assets del documento |
| DELETE | `/api/v1/assets/:assetId` | ✅ editor | Elimina asset (también de R2) |

### Drafts (borradores)

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/documents/:docId/draft` | ✅ editor | Obtiene borrador activo |
| PUT | `/api/v1/documents/:docId/draft` | ✅ editor | Guarda/actualiza borrador (autoguardado) |

### Versions

| Método | Endpoint | Auth | Rol mínimo | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/documents/:docId/versions` | ✅ | viewer* | Lista versiones del historial |
| POST | `/api/v1/documents/:docId/versions` | ✅ | editor | Guarda versión nombrada desde borrador |
| GET | `/api/v1/versions/:versionId` | ✅ | viewer* | Obtiene versión específica con contenido |
| DELETE | `/api/v1/versions/:versionId` | ✅ | editor** | Elimina versión borrador |
| POST | `/api/v1/versions/:versionId/set-current` | ✅ | editor | Marca como Versión Actual |

> *Viewer solo puede acceder si `can_view_history = true` en su membresía.
> **Editor solo puede eliminar versiones borrador propias. Admin puede eliminar cualquiera.

### Diff

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/diff?versionA=:id&versionB=:id` | ✅ viewer | Calcula y retorna diff entre dos versiones |

El diff se calcula on-demand en el servidor usando diff-match-patch sobre el JSON serializado de cada versión. No se persiste.

### Merge

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/documents/:docId/conflicts` | ✅ editor | Detecta versiones en conflicto (mismo based_on_version_id) |
| POST | `/api/v1/documents/:docId/merge` | ✅ editor | Guarda versión de merge con trazabilidad de origen |

### Shares

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/documents/:docId/shares` | ✅ editor | Genera link compartido (fijo o dinámico) |
| GET | `/api/v1/documents/:docId/shares` | ✅ editor | Lista links activos del documento |
| DELETE | `/api/v1/shares/:shareId` | ✅ editor | Revoca link (setea revoked_at) |
| GET | `/api/v1/public/:token` | ❌ | Resuelve link público — retorna documento |

### Notifications

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/notifications` | ✅ | Lista notificaciones del usuario |
| PATCH | `/api/v1/notifications/:id/read` | ✅ | Marca notificación como leída |
| PATCH | `/api/v1/notifications/read-all` | ✅ | Marca todas como leídas |
| GET | `/api/v1/notifications/stream` | ✅ | SSE stream de notificaciones en tiempo real |

### Imports

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/folders/:folderId/imports` | ✅ editor | Sube .docx y procesa. Retorna documento creado + warnings |

### Health

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | ❌ | Estado del servidor (usado por Railway/Render) |

---

## 5. Especificación por módulo

---

### 5.1 Módulo: `auth`

**Archivos:**
```
auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  strategies/
    jwt-access.strategy.ts
    jwt-refresh.strategy.ts
    local.strategy.ts
  dto/
    register.dto.ts
    login.dto.ts
    refresh-token.dto.ts
    forgot-password.dto.ts
    reset-password.dto.ts
    verify-email.dto.ts
```

**Responsabilidades del service:**
- `register(dto)`: hashea password con bcrypt (rounds: 12), crea usuario, genera token de verificación de email (UUID v4, expira en 24h), guarda en `password_reset_tokens` con tipo implícito (o tabla separada si se prefiere), envía email de verificación.
- `login(dto)`: verifica credenciales, verifica que `email_verified_at` no sea NULL (lanza `403 EMAIL_NOT_VERIFIED` si lo es), genera access token (15m) y refresh token (7d), guarda refresh token hasheado en `refresh_tokens`.
- `refresh(dto)`: valida refresh token, verifica que no esté revocado (`revoked_at IS NULL`) ni expirado, genera nuevo par de tokens, rota el refresh token (invalida el anterior).
- `logout(userId, tokenId)`: setea `revoked_at` en el refresh token activo.
- `verifyEmail(token)`: busca token en BD, verifica `expires_at`, setea `email_verified_at` en users, marca token como usado.
- `forgotPassword(email)`: genera token de reset (expira en 1h), guarda en `password_reset_tokens`, envía email. Si el email no existe, responde igual (no revela existencia).
- `resetPassword(token, newPassword)`: valida token, hashea nueva contraseña, actualiza `password_hash`, marca token como usado, revoca todos los refresh tokens del usuario.

**Guards usados:** ninguno (todos los endpoints son públicos).

**Validaciones DTO:**
- `email`: `@IsEmail()`, `@MaxLength(255)`
- `password`: `@MinLength(8)`, `@MaxLength(100)`, debe contener al menos una letra y un número
- `name`: `@IsString()`, `@MaxLength(255)`, `@IsOptional()`

---

### 5.2 Módulo: `users`

**Archivos:**
```
users/
  users.module.ts
  users.controller.ts
  users.service.ts
  dto/
    update-profile.dto.ts
    change-password.dto.ts
    user-response.dto.ts
```

**Responsabilidades del service:**
- `findById(id)`: retorna usuario sin `password_hash`.
- `updateProfile(id, dto)`: actualiza `full_name`.
- `changePassword(id, dto)`: verifica contraseña actual con bcrypt.compare, hashea nueva, actualiza, revoca todos los refresh tokens.
- `revokeAllSessions(id)`: setea `revoked_at` en todos los refresh tokens activos del usuario.

**UserResponseDto** (nunca incluye `password_hash`):
```
id, email, full_name, email_verified_at, created_at
```

---

### 5.3 Módulo: `workspaces`

**Archivos:**
```
workspaces/
  workspaces.module.ts
  workspaces.controller.ts
  workspaces.service.ts
  dto/
    create-workspace.dto.ts
    update-workspace.dto.ts
    workspace-response.dto.ts
    member-response.dto.ts
    update-member-role.dto.ts
```

**Responsabilidades del service:**
- `create(userId, dto)`: crea workspace, inserta entrada en `workspace_members` con `role = 'admin'` para el creador.
- `findAllForUser(userId)`: retorna workspaces donde el usuario es miembro.
- `findOne(wsId, userId)`: valida membresía del usuario, retorna workspace.
- `update(wsId, dto)`: solo Admin.
- `delete(wsId, userId)`: solo Admin. Requiere `confirm: true` en el body.
- `getMembers(wsId)`: lista members con user info (sin password).
- `addMember(wsId, userId, dto)`: Admin. Si el usuario ya es miembro, lanza `409 ALREADY_MEMBER`.
- `updateMemberRole(wsId, targetUserId, dto)`: Admin. El trigger de MySQL bloquea si es el último admin.
- `removeMember(wsId, targetUserId)`: Admin. El trigger de MySQL bloquea si es el último admin.
- `getActivity(wsId)`: retorna los 20 documentos modificados más recientemente en el workspace.

**WorkspaceRoleGuard:** extrae `wsId` de los params, verifica que el usuario autenticado sea miembro del workspace con el rol mínimo requerido (especificado con `@WorkspaceRoles('admin')`).

---

### 5.4 Módulo: `invitations`

**Archivos:**
```
invitations/
  invitations.module.ts
  invitations.controller.ts
  invitations.service.ts
  dto/
    create-invitation.dto.ts
    invitation-response.dto.ts
```

**Responsabilidades del service:**
- `create(wsId, adminId, dto)`: verifica que el email no sea ya miembro del workspace. Genera token UUID, calcula `expires_at = now + 7 días`. Si el email ya tiene una invitación pendiente, la reemplaza. Persiste en `workspace_invitations`. Llama a `EmailService.sendInvitation()` (stub en MVP: solo log).
- `validate(token)`: busca token, verifica que `accepted_at IS NULL` y `expires_at > now`. Retorna datos de la invitación (workspace name, rol).
- `accept(token, userId)`: valida token, verifica que el email del usuario coincida con el email de la invitación. Crea `workspace_members`. Setea `accepted_at`.
- `cancel(invitationId, wsId)`: Admin. Elimina el registro.

---

### 5.5 Módulo: `projects`

**Archivos:**
```
projects/
  projects.module.ts
  projects.controller.ts
  projects.service.ts
  dto/
    create-project.dto.ts
    update-project.dto.ts
    project-response.dto.ts
```

**Responsabilidades del service:**
- `findAll(wsId, userId, query)`: lista proyectos del workspace. Soporta búsqueda FULLTEXT por `name`. Verifica que el usuario sea miembro del workspace.
- `create(wsId, dto)`: solo Admin.
- `findOne(projectId, userId)`: verifica membresía en el workspace padre.
- `update(projectId, dto)`: solo Admin.
- `delete(projectId)`: solo Admin. Cascada elimina carpetas, documentos, versiones.

**ProjectResponseDto:** `id, workspace_id, name, folder_count, created_at, updated_at`

---

### 5.6 Módulo: `folders`

Estructura idéntica a `projects/`. El service verifica que el `project_id` pertenezca a un workspace donde el usuario es miembro.

**FolderResponseDto:** `id, project_id, name, document_count, created_at, updated_at`

---

### 5.7 Módulo: `documents`

**Archivos:**
```
documents/
  documents.module.ts
  documents.controller.ts
  documents.service.ts
  dto/
    create-document.dto.ts
    update-document.dto.ts
    move-document.dto.ts
    document-response.dto.ts
    document-member.dto.ts
```

**Responsabilidades del service:**
- `findAll(folderId, userId, query)`: lista documentos. Incluye para cada uno: `current_version` (name, created_by, created_at) si existe. Soporta filtro por nombre (FULLTEXT), fecha creación, fecha modificación.
- `create(folderId, userId, dto)`: crea documento y borra vacío en `document_drafts` (`content: { type: 'doc', content: [] }`). Crea entrada en `document_members` con `role = 'editor'` para el creador.
- `findOne(docId, userId)`: verifica acceso (workspace member o document member). Retorna documento + Versión Actual si existe.
- `update(docId, dto)`: Editor o Admin del workspace.
- `delete(docId, userId)`: solo Admin. Requiere `?confirm=true`. Antes de eliminar, consulta los `shared_links` activos del documento para advertir cuántos quedarán rotos (incluir en respuesta del `GET /documents/:id` como `active_links_count`).
- `move(docId, dto)`: verifica que la carpeta destino pertenezca al mismo workspace.
- `getMembers(docId)`: Editor o Admin.
- `addMember(docId, dto)`: Editor o Admin. Si ya existe, actualiza `can_view_history`.
- `updateMember(docId, userId, dto)`: actualiza solo `can_view_history`.
- `removeMember(docId, userId)`: Editor o Admin.

**DocumentRoleGuard:** verifica acceso al documento a través de membresía en workspace (con rol mínimo viewer) O membresía directa en `document_members`.

---

### 5.8 Módulo: `assets`

**Archivos:**
```
assets/
  assets.module.ts
  assets.controller.ts
  assets.service.ts
  dto/
    asset-response.dto.ts
```

**Responsabilidades del service:**
- `upload(docId, userId, file)`: valida `mimetype` (solo `image/jpeg`, `image/png`, `image/gif`, `image/webp`). Valida tamaño máximo (10 MB). Genera `storage_key = assets/{docId}/{uuid}.{ext}`. Sube a R2 vía `StorageService`. Persiste en `document_assets`. Retorna `{ id, url }`.
- `findAll(docId)`: lista assets del documento.
- `delete(assetId, userId)`: verifica que el usuario sea Editor del documento. Elimina de R2 y de la BD.

**Multer config:** `memoryStorage()`, límite 10 MB, filtro por mimetype.

---

### 5.9 Módulo: `drafts`

**Archivos:**
```
drafts/
  drafts.module.ts
  drafts.controller.ts
  drafts.service.ts
  dto/
    save-draft.dto.ts
    draft-response.dto.ts
```

**Responsabilidades del service:**
- `get(docId, userId)`: retorna borrador activo. Si no existe, retorna `null` (el frontend inicializa el editor con contenido vacío).
- `save(docId, userId, dto)`: upsert en `document_drafts` (INSERT ON DUPLICATE KEY UPDATE). Actualiza `content` y `updated_by`. El Viewer nunca llega aquí (guard lo impide).

**Throttling:** el endpoint `PUT /draft` tiene rate limit de 2 req/seg por usuario para evitar floods del autoguardado.

---

### 5.10 Módulo: `versions`

**Archivos:**
```
versions/
  versions.module.ts
  versions.controller.ts
  versions.service.ts
  dto/
    create-version.dto.ts
    version-response.dto.ts
    version-list-item.dto.ts
```

**Responsabilidades del service:**
- `findAll(docId, userId)`: lista versiones. Para Viewer: solo si `can_view_history = true`. Retorna list items (sin `content` completo para optimizar payload).
- `create(docId, userId, dto)`: toma el `content` del `document_drafts` actual. Crea registro en `document_versions` con `based_on_version_id` enviado por el cliente. Si `dto.markAsCurrent = true`: llama a `setCurrent` en la misma transacción.
- `findOne(versionId, userId)`: verifica acceso. Retorna versión completa con `content`.
- `setCurrent(versionId, docId, userId)`: setea `is_current = 1` (el trigger de MySQL desactiva las demás). Crea notificación `new_current_version` para todos los miembros del documento. Emite evento SSE.
- `delete(versionId, userId)`: verifica que la versión sea un borrador (sin nombre — en realidad que no sea `is_current` y que no tenga historial posterior). Solo Editor puede eliminar las propias, Admin puede eliminar cualquiera excepto `is_current` sin confirmación especial.

**VersionListItemDto:** `id, name, comment, source, created_by, created_at, is_current, based_on_version_id`

**VersionResponseDto:** añade `content` (el JSON de ProseMirror completo).

---

### 5.11 Módulo: `diff`

**Archivos:**
```
diff/
  diff.module.ts
  diff.controller.ts
  diff.service.ts
  dto/
    diff-response.dto.ts
```

**Responsabilidades del service:**
- `compute(versionAId, versionBId, userId)`: verifica acceso a ambas versiones. Obtiene `content` de cada una. Serializa el JSON de ProseMirror a texto plano (o nodo por nodo). Aplica `diff-match-patch`. Retorna estructura de diff con:
  - `summary`: `{ added: N, removed: N, modified: N }`
  - `changes`: array de `{ type: 'equal'|'insert'|'delete', content: string, nodeType: string }`

**Nota de implementación:** el diff se hace nodo por nodo del AST de ProseMirror, no sobre el JSON serializado completo. Esto permite identificar qué sección (párrafo, encabezado, bloque de código) cambió.

---

### 5.12 Módulo: `merge`

**Archivos:**
```
merge/
  merge.module.ts
  merge.controller.ts
  merge.service.ts
  dto/
    create-merge.dto.ts
    conflict-response.dto.ts
```

**Responsabilidades del service:**
- `getConflicts(docId, userId)`: busca pares de versiones con el mismo `based_on_version_id` en el mismo documento. Retorna los pares de versiones en conflicto.
- `createMerge(docId, userId, dto)`: recibe `{ content, mergeFromA, mergeFromB, name, comment, markAsCurrent }`. Crea versión con `source = 'merge'`, `merge_from_a`, `merge_from_b` populados. Si `markAsCurrent = true`, llama `VersionsService.setCurrent`.

---

### 5.13 Módulo: `shares`

**Archivos:**
```
shares/
  shares.module.ts
  shares.controller.ts
  shares.service.ts
  dto/
    create-share.dto.ts
    share-response.dto.ts
    public-document-response.dto.ts
```

**Responsabilidades del service:**
- `create(docId, userId, dto)`: valida `dto.mode`. Si `mode = 'fixed'`, requiere `versionId`. Genera token: `crypto.randomBytes(32).toString('hex')`. Crea `shared_links`.
- `findAll(docId, userId)`: lista links del documento (activos y revocados).
- `revoke(shareId, userId)`: verifica que el usuario sea Editor del documento. Setea `revoked_at = now()`.
- `resolve(token)`: verifica que `revoked_at IS NULL`. Si `mode = 'dynamic'`: obtiene la Versión Actual del documento. Si `mode = 'fixed'`: obtiene la versión apuntada. Si la versión no existe (eliminada): retorna `410 VERSION_DELETED`. Retorna `{ document, version, allowHistory, mode }`.

**PublicDocumentResponseDto:** excluye cualquier dato de usuario o workspace que no sea el nombre del documento. Incluye solo `document_title`, `version_name`, `version_content`, `allow_history`, `mode`.

---

### 5.14 Módulo: `notifications`

**Archivos:**
```
notifications/
  notifications.module.ts
  notifications.controller.ts
  notifications.service.ts
  dto/
    notification-response.dto.ts
```

**Responsabilidades del service:**
- `findAll(userId, query)`: lista notificaciones paginadas. Soporta filtro `?unread=true`.
- `markRead(notificationId, userId)`: setea `read_at`.
- `markAllRead(userId)`: update masivo donde `user_id = userId AND read_at IS NULL`.
- `create(dto)`: método interno. Crea notificación en BD y emite evento SSE al usuario correspondiente vía `SseService`.
- `getStream(userId, res)`: configura headers SSE, registra la conexión en `SseService`, envía heartbeat cada 30 segundos para mantener la conexión viva.

**SseService (en `integrations/sse/`):**
- Mantiene un `Map<userId, Response[]>` con las conexiones activas.
- `emit(userId, event)`: itera las conexiones del usuario y escribe el evento SSE.
- Maneja desconexiones limpiando el map.
- En producción con múltiples instancias: usa Redis Pub/Sub. El servidor que recibe el evento lo publica en Redis; todos los servidores están suscritos y emiten a sus conexiones locales.

---

### 5.15 Módulo: `imports`

**Archivos:**
```
imports/
  imports.module.ts
  imports.controller.ts
  imports.service.ts
  pipeline/
    docx-to-html.parser.ts
    html-to-prosemirror.transformer.ts
    warnings-collector.ts
```

**Responsabilidades del service:**
- `importDocx(folderId, userId, file)`:
  1. Recibe el archivo `.docx` en memoria (Multer).
  2. `mammoth.convertToHtml(buffer)` — extrae HTML y mensajes de mammoth.
  3. `HtmlToProsemirrorTransformer.convert(html)` — transforma a AST de ProseMirror.
  4. `WarningsCollector.collect(mammothMessages)` — normaliza los warnings en formato `{ element, reason }[]`.
  5. Crea documento en la carpeta: `DocumentsService.create(folderId, userId, { title: filename })`.
  6. Crea versión inicial: `VersionsService.create(docId, userId, { name: 'v1.0', comment: 'Importado desde ' + filename, content: prosemirrorAst, import_warnings: warnings, source: 'import', markAsCurrent: true })`.
  7. Retorna `{ document, version, warnings }`.

**Elementos soportados en la transformación:**
- Headings H1-H3 → nodos `heading` de ProseMirror
- Párrafos → nodos `paragraph`
- Negrita, cursiva, subrayado, tachado → marks
- Listas ordenadas y no ordenadas → `bulletList` / `orderedList`
- Bloques de código → `codeBlock`
- Links → mark `link`
- Imágenes → nodo `image` con URL temporal (se avisa en warnings que no fueron subidas a R2)

**Elementos NO soportados (generan warning):**
- Tablas
- Imágenes embebidas en base64 (se omiten)
- Campos de formulario
- Encabezados y pies de página del documento Word

---

## 6. Capas transversales

### 6.1 `HttpExceptionFilter`

Captura todas las excepciones y las formatea con el envelope estándar de error. Distingue `HttpException` de `PrismaClientKnownRequestError` (código P2025 = registro no encontrado → 404).

### 6.2 `JwtAuthGuard`

Guard global aplicado a todos los endpoints excepto los marcados con `@Public()`. Extrae el bearer token del header `Authorization`, lo valida con la estrategia `jwt-access`.

### 6.3 `WorkspaceRoleGuard`

Se aplica junto con `@WorkspaceRoles('admin' | 'editor' | 'viewer')`. Extrae `wsId` de los params (o lo resuelve a través del recurso hijo). Consulta `workspace_members` para verificar el rol del usuario. La jerarquía de roles es: `admin > editor > viewer` (un admin satisface un requerimiento de editor o viewer).

### 6.4 `DocumentRoleGuard`

Similar a `WorkspaceRoleGuard` pero para acceso a nivel de documento. Evalúa: (1) si el usuario es miembro del workspace con rol viewer o superior, O (2) si tiene entrada en `document_members`. El permiso más amplio siempre prevalece.

### 6.5 `ResponseTransformInterceptor`

Envuelve todas las respuestas exitosas en el envelope estándar `{ success: true, data: ..., meta: { timestamp } }`.

### 6.6 `LoggingInterceptor`

Loguea en formato estructurado: `method`, `url`, `statusCode`, `duration`, `userId` (si autenticado). Compatible con Sentry.

### 6.7 Throttling global

`ThrottlerModule` configurado: 100 requests / 60 segundos por IP para endpoints públicos. 300 requests / 60 segundos por usuario para endpoints autenticados. El endpoint `/api/v1/documents/:docId/draft` tiene su propio límite de 2 req/seg.

---

## 7. Modelos de datos (DTOs canónicos)

### AuthTokensDto
```
access_token: string   # JWT, expira en 15m
refresh_token: string  # opaco, expira en 7d
expires_in: number     # segundos hasta expiración del access token
```

### WorkspaceDto
```
id: string
name: string
created_by: string | null
member_count: number
role: 'admin' | 'editor' | 'viewer'   # rol del usuario autenticado
created_at: string
updated_at: string
```

### DocumentDto
```
id: string
folder_id: string
title: string
created_by: string | null
current_version: VersionListItemDto | null
active_links_count: number
user_role: 'editor' | 'viewer'         # rol del usuario autenticado
created_at: string
updated_at: string
```

### VersionListItemDto
```
id: string
document_id: string
name: string
comment: string | null
source: 'manual' | 'import' | 'merge'
is_current: boolean
created_by: { id, full_name } | null
based_on_version_id: string | null
created_at: string
```

### DiffResponseDto
```
version_a: VersionListItemDto
version_b: VersionListItemDto
summary: { added: number, removed: number, modified: number, unchanged: number }
changes: Array<{
  type: 'equal' | 'insert' | 'delete' | 'replace'
  nodeType: string      # 'paragraph' | 'heading' | 'codeBlock' | 'image' | ...
  level: number | null  # para headings
  a: string | null      # contenido en versión A (null si es insert puro)
  b: string | null      # contenido en versión B (null si es delete puro)
}>
```

### ShareResponseDto
```
id: string
token: string
url: string             # FRONTEND_URL + '/s/' + token
mode: 'fixed' | 'dynamic'
allow_history: boolean
version_id: string | null
created_by: { id, full_name }
created_at: string
revoked_at: string | null
```

### NotificationDto
```
id: string
type: 'new_current_version' | 'save_conflict' | 'member_invited'
document_id: string | null
related_user_id: string | null
payload: object
read_at: string | null
created_at: string
```

---

## 8. Reglas de negocio críticas

Estas reglas se implementan en los services. Algunas ya tienen soporte a nivel de BD (triggers), pero deben validarse también en la capa de aplicación para dar mensajes de error amigables antes de que MySQL lance el error del trigger.

| Regla | Dónde implementar | Qué retornar si falla |
|---|---|---|
| Workspace siempre tiene al menos 1 Admin | `WorkspacesService.removeMember` y `updateMemberRole` (check previo al query) | `409 LAST_ADMIN_CANNOT_BE_REMOVED` |
| Link fijo siempre tiene version_id | `SharesService.create` (validación DTO) | `400 FIXED_LINK_REQUIRES_VERSION` |
| Versión Actual única por documento | Trigger MySQL + no requiere check adicional | — |
| Editor solo puede eliminar borradores propios | `VersionsService.delete` (check `created_by === userId` si no es admin) | `403 CANNOT_DELETE_OTHERS_VERSION` |
| Viewer no puede ver borrador | `DraftsController` — `@DocumentRoles('editor')` | `403 INSUFFICIENT_ROLE` |
| Detección de conflicto en guardado | `VersionsService.create`: verifica si ya existe versión con el mismo `based_on_version_id` en el documento. Si existe → guarda la nueva versión con flag y crea notificación `save_conflict` para ambos editores | — |
| Email no verificado no puede hacer login | `AuthService.login` | `403 EMAIL_NOT_VERIFIED` |
| Eliminación de documento requiere confirmación | `DocumentsService.delete` verifica `query.confirm === 'true'` | `400 CONFIRMATION_REQUIRED` |

---

## 9. Testing

### Estrategia

**Unit tests (`test/unit/`):**
- Un archivo `.spec.ts` por cada service.
- Mock de `PrismaService` con `jest.mock`.
- Coverage obligatorio: `AuthService`, `VersionsService`, `DiffService`, `MergeService`, `ImportsService`.
- El diff engine se testea con fixtures de ProseMirror JSON conocidos.

**E2E tests (`test/e2e/`):**
- Usando `supertest` contra el servidor NestJS levantado en memoria.
- Base de datos de test: instancia MySQL dedicada (o `testcontainers`).
- Flujos cubiertos obligatoriamente:
  1. Registro → verificación de email → login → onboarding completo
  2. Crear documento → guardar borrador → guardar versión → marcar como actual → notificar
  3. Generar link dinámico → acceder como público → cambiar Versión Actual → acceder de nuevo
  4. Conflicto de guardado → detección → merge → marcar como actual

### Comando de test

```bash
npm run test          # unit
npm run test:e2e      # e2e
npm run test:cov      # coverage
```

### Coverage mínimo requerido

| Módulo | Line coverage |
|---|---|
| auth | 90% |
| versions | 85% |
| diff | 90% |
| merge | 85% |
| shares | 80% |
| imports | 75% |
| resto | 70% |
