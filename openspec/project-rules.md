# Versionly — Reglas del Proyecto

> Fuente de verdad para decisiones técnicas y de proceso. Ante conflicto con otro documento, este prevalece sobre los artifacts y cede ante `CLAUDE.md`.

---

## 1. Monorepo

| Directorio | Stack | Descripción |
|---|---|---|
| `api/` | NestJS 10 + Prisma + PostgreSQL | Backend REST + SSE |
| `app/` | Next.js 15 App Router + TanStack Query v5 | Frontend BFF |
| `openspec/` | Spec-Driven Development | Propuestas y cambios |
| `artifacts/` | Documentación de producto | Análisis, specs, modelo de dominio |
| `.ai/` | Infraestructura de agentes | Router, skills, protocolos |

---

## 2. Reglas innegociables

### General
- Responder siempre en español.
- Todo cambio que afecte API o dominio se propone primero en `openspec/changes/` antes de implementarse.
- Archivos en `kebab-case` en ambos proyectos.
- No inventar estados paralelos — el estado del workflow vive en el ContextPacket.

### Backend (`api/`)
- Arquitectura hexagonal: lógica en Services, nunca en Controllers.
- `synchronize: false` en Prisma — siempre usar migraciones explícitas.
- Nunca crear migraciones manualmente. Usar: `npx prisma migrate dev --name <Nombre>`.
- JWT RS256 obligatorio. Nunca HS256.
- Todo endpoint autenticado lleva `JwtAuthGuard` + guard de rol correspondiente.
- Errores de negocio: `BusinessException`. Nunca `throw new Error()` suelto.
- Nunca loguear: tokens, passwords, PII (email, IP en logs de negocio).

### Frontend (`app/`)
- Stack: TypeScript strict + TanStack Query v5 + Tailwind CSS v4 + shadcn/ui + React Hook Form + Zod.
- Tokens JWT: **nunca** en `localStorage` ni `sessionStorage`. Solo cookies `httpOnly` vía BFF.
- API calls: siempre vía BFF (`/api/backend/[path]`), nunca directo al backend desde el browser.
- `dangerouslySetInnerHTML`: prohibido.
- Formularios: React Hook Form + Zod + `noValidate` en el `<form>`.

---

## 3. Versiones del producto

| Versión | Alcance |
|---|---|
| **v1.0 MVP** | Auth, workspaces, proyectos, carpetas, documentos, editor, versiones, diff, merge, compartir, notificaciones, importación `.docx` |
| **v1.1** | Integración Google Drive OAuth2 (importación intencional) |
| **v2.0** | Colaboración en tiempo real, Watch API de Google Drive |

---

## 4. RBAC

| Rol | Alcance | Capacidades clave |
|---|---|---|
| `WorkspaceRole.admin` | Workspace | Gestión de miembros, eliminar versiones, acceso total |
| `WorkspaceRole.editor` | Workspace | Crear/editar documentos, guardar versiones |
| `WorkspaceRole.viewer` | Workspace | Solo lectura |
| `DocumentRole.editor` | Documento | Editar borrador, guardar versión |
| `DocumentRole.viewer` | Documento | Solo lectura del documento |

---

## 5. Naming de changes en OpenSpec

| Prefix | Scope |
|---|---|
| `api-` | Afecta únicamente `api/` |
| `app-` | Afecta únicamente `app/` |
| `shared-` | Afecta ambos proyectos |

---

## 6. Comandos de verificación

```bash
# Backend
cd api && npm run typecheck
cd api && npm run test
cd api && npx prisma migrate dev --name <Nombre>

# Frontend
cd app && npm run lint
cd app && npm run typecheck

# Monorepo
node start.js   # levanta api + app en paralelo
```

---

## 7. Deuda técnica activa

Registrada en `artifacts/Versionly_Log_Incidencias.md`.

| Gap | Severidad | Estado |
|---|---|---|
| CORS `origin: true` en `api/src/main.ts` | Media | Pendiente |
| Sin Helmet.js en API | Media | Pendiente |
| Sin CSP en frontend | Media | Pendiente |
| Sin rate limiting en login/register | Media | Pendiente |
| Full-text search MySQL → PG (`tsvector`) | Baja | Pendiente post-migración |
