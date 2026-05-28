# Change: api-migrate-mysql-to-postgresql

**Scope:** `api/`  
**Agente responsable:** DB Agent  
**Versión del producto:** v1.0 MVP  
**Estado:** proposed  
**Fecha:** 2026-05-28

---

## Contexto

El backend (`api/`) fue inicializado con Prisma + MySQL 8.0. La decisión técnica revisada establece PostgreSQL como base de datos objetivo por sus ventajas concretas para el dominio de Versionly:

- **Full-text search nativo** (`tsvector`/`GIN index`) sobre contenido de documentos y títulos.
- **JSONB** con indexación parcial para el contenido del editor (ProseMirror JSON).
- **Window functions** eficientes para queries de versiones (`LAG`, `ROW_NUMBER` sobre historial).
- **CTEs recursivas** para la jerarquía Workspace → Proyecto → Carpeta → Documento.
- **UUID nativo** como tipo de columna (`uuid`).

El ORM permanece **Prisma** — no se migra a TypeORM. El código de los módulos (`src/modules/`) no se toca.

---

## Cambios requeridos

### 1. `api/prisma/schema.prisma`

| Elemento | Antes (MySQL) | Después (PostgreSQL) |
|---|---|---|
| `provider` | `"mysql"` | `"postgresql"` |
| `previewFeatures` | `["fullTextIndex"]` | eliminar (no aplica en PG) |
| IDs `@db.Char(36)` | `String @id @db.Char(36)` | `String @id @db.Uuid` |
| Timestamps `@db.DateTime(6)` | `DateTime @db.DateTime(6)` | `DateTime @db.Timestamptz` |
| JSON fields `@db.Json` | `Json @db.Json` | `Json @db.Json` (o `@db.JsonB` para JSONB) |
| `@db.UnsignedInt` | `Int @db.UnsignedInt` | `Int` (sin anotación — PG no tiene unsigned) |
| `@@fulltext([...])` | presente en Project, Folder, Document | eliminar (PG usa `gin`/`tsvector` — se agrega como deuda técnica) |
| `@db.VarChar(N)` | `String @db.VarChar(N)` | mantener (compatible con PG) |
| `@db.Text` | `String @db.Text` | mantener (compatible con PG) |

### 2. `api/.env` y `api/.env.example`

```
# Antes
DATABASE_URL=mysql://root:RootPass123!@host:3307/versionly_db

# Después
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/versionly_db
```

### 3. `api/src/common/filters/prisma-exception.filter.ts`

Verificar que los códigos de error manejados correspondan a Prisma + PostgreSQL (los códigos `P2002`, `P2025` son idénticos — no requiere cambios de lógica).

### 4. Artifacts a actualizar

- `artifacts/Versionly_Schema_MySQL.sql` → renombrar a `Versionly_Schema_PostgreSQL.sql` y adaptar sintaxis SQL.
- `artifacts/Versionly_Stack_Tecnologico.md` → actualizar sección Backend: MySQL → PostgreSQL.
- `artifacts/Versionly_Reglas_Generales.md` → sección 5: actualizar stack técnico.

---

## Impacto

| Capa | Impacto |
|---|---|
| Módulos `src/modules/` | **Ninguno** — Prisma abstrae el proveedor |
| Schema Prisma | Cambios de tipos de columna (automáticos en nueva migración) |
| Base de datos | Drop & recreate en dev. En prod: nueva instancia PostgreSQL |
| Tests | Verificar que los tests de integración apunten a PG |
| Docker/CI | Cambiar imagen `mysql:8.0` → `postgres:16-alpine` |

---

## Criterios de aceptación

- [ ] `schema.prisma` usa `provider = "postgresql"`.
- [ ] `npx prisma generate` completa sin errores.
- [ ] `npx prisma migrate dev --name init` genera SQL válido para PostgreSQL.
- [ ] `npm run typecheck` sin errores en `api/`.
- [ ] El servidor levanta con `npm run start:dev` conectado a PostgreSQL.
- [ ] `GET /api/health` retorna 200.
