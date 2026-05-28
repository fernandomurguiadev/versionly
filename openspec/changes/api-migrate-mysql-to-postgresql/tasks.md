# Tasks: api-migrate-mysql-to-postgresql

**Agente:** DB Agent  
**Última actualización:** 2026-05-28

---

## Fase 1 — Schema Prisma

- [ ] Cambiar `provider = "mysql"` → `"postgresql"` en `schema.prisma`
- [ ] Eliminar `previewFeatures = ["fullTextIndex"]` del generator
- [ ] Reemplazar todos los `@db.Char(36)` → `@db.Uuid` en campos de ID
- [ ] Reemplazar todos los `@db.DateTime(6)` → `@db.Timestamptz`
- [ ] Reemplazar `@db.UnsignedInt` → eliminar la anotación (dejar `Int` solo) en `DocumentAsset.sizeBytes`
- [ ] Reemplazar `@db.Json` → `@db.JsonB` en `DocumentDraft.content`, `DocumentVersion.content`, `DocumentVersion.importWarnings`, `Notification.payload`
- [ ] Eliminar todos los `@@fulltext([...])` (Project, Folder, Document) — registrar como deuda técnica en `Versionly_Log_Incidencias.md`

## Fase 2 — Variables de entorno

- [ ] Actualizar `api/.env.example`: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/versionly_db`
- [ ] Actualizar `api/.env` local (no commitear)

## Fase 3 — Migración inicial

- [ ] Avisar al usuario: ejecutar `npx prisma migrate dev --name init-postgresql` desde `api/`
- [ ] Verificar SQL generado — confirmar que no hay tipos MySQL residuales
- [ ] Verificar que `npx prisma generate` completa sin errores

## Fase 4 — Verificación

- [ ] `npm run typecheck` sin errores
- [ ] `npm run start:dev` levanta sin errores de conexión
- [ ] `GET /api/health` retorna 200

## Fase 5 — Artifacts

- [ ] Renombrar `artifacts/Versionly_Schema_MySQL.sql` → `Versionly_Schema_PostgreSQL.sql`
- [ ] Adaptar sintaxis SQL del artifact: `DATETIME(6)` → `TIMESTAMPTZ`, `TINYINT(1)` → `BOOLEAN`, `ENGINE=InnoDB` → eliminar, `UNSIGNED` → eliminar
- [ ] Actualizar `artifacts/Versionly_Stack_Tecnologico.md` sección Backend: MySQL 8.0 → PostgreSQL 16
- [ ] Actualizar `artifacts/Versionly_Reglas_Generales.md` sección 5: stack técnico

---

## Deuda técnica generada

- Full-text search sobre `projects.name`, `folders.name`, `documents.title`: migrar a `GIN index` sobre `tsvector` (registrar en Log de Incidencias — baja prioridad para MVP, puede hacerse en v1.0.1).
