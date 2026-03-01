# Versionly — Log de Incidencias
**Versión 2.0 · Febrero 2026 · Documento vivo**

---

## 1. Objetivo
Registrar de forma clara las incidencias del proyecto para asegurar trazabilidad, análisis de impacto y corrección consistente.

---

## 2. Opciones recomendadas
**Tipo**
- Incongruencia
- Diseño
- Seguridad
- Performance
- UX
- Operación
- Dependencias

**Severidad**
- Baja
- Media
- Alta
- Crítica

**Estado**
- Pendiente
- En análisis
- En progreso
- Resuelto
- Descarta

**Área**
- Backend
- Frontend
- API
- Infra
- Datos
- Producto

**Impacto**
- Funcional
- Técnico
- Seguridad
- Costos
- Time-to-market

---

## 3. Formato de registro
**Formato rápido**
```
[YYYY-MM-DD HH:MM] Tipo | Severidad | Área | Estado | Descripción | Sugerencia
```

**Formato detallado (tabla)**
| ID | Fecha | Tipo | Severidad | Área | Estado | Descripción | Impacto | Sugerencia | Referencias |
|---|---|---|---|---|---|---|---|---|---|

---

## 4. Ejemplo
**Formato rápido**
```
[2026-02-21 12:10] Incongruencia | Media | API | Pendiente | Filtros y búsqueda no están en el contrato base | Agregar endpoints de búsqueda y filtros en documentos/proyectos
```

**Formato detallado**
| ID | Fecha | Tipo | Severidad | Área | Estado | Descripción | Impacto | Sugerencia | Referencias |
|---|---|---|---|---|---|---|---|---|---|
| INC-0001 | 2026-02-21 12:10 | Incongruencia | Media | API | Resuelto | Filtros y búsqueda no están en el contrato base | Funcional | Se agregaron parámetros estándar de listado en el contrato base | Versionly_Analisis_Funcional_MVP.md, Versionly_API_Contrato_Base.md |

---

## 5. Incidencias registradas
### INC-0001 — Filtros y búsqueda sin endpoints
- Fecha: 2026-02-21 12:10
- Tipo: Incongruencia
- Severidad: Media
- Área: API
- Estado: Resuelto
- Impacto: Funcional
- Descripción: El análisis funcional incluye filtros y búsqueda pero el contrato base no contempla endpoints de búsqueda.
- Sugerencia: Se agregaron parámetros estándar de listado en el contrato base.
- Referencias: Versionly_Analisis_Funcional_MVP.md, Versionly_API_Contrato_Base.md

### INC-0002 — Warnings de importación sin persistencia
- Fecha: 2026-02-21 12:10
- Tipo: Diseño
- Severidad: Media
- Área: Backend
- Estado: Resuelto
- Impacto: Técnico
- Descripción: El flujo de importación requiere guardar warnings de formato, pero el esquema no define dónde persistirlos.
- Sugerencia: Agregar campo import_warnings en versions o tabla específica.
- Referencias: Versionly_Analisis_Funcional_MVP.md, Versionly_Schema_MySQL.sql

### INC-0003 — Acceso por link sin auditoría
- Fecha: 2026-02-21 12:10
- Tipo: Seguridad
- Severidad: Media
- Área: Backend
- Estado: Resuelto
- Impacto: Seguridad
- Descripción: El acceso por link externo debe registrar timestamp e IP, pero no existe entidad para esos accesos.
- Sugerencia: Crear tabla de access_logs para links compartidos.
- Referencias: Versionly_Sistema_de_Roles.md, Versionly_Schema_MySQL.sql

### INC-0004 — Backend MVP incompleto vs contrato/spec
- Fecha: 2026-02-22 10:38
- Tipo: Incongruencia
- Severidad: Alta
- Área: Backend
- Estado: Resuelto
- Impacto: Time-to-market
- Descripción: El backend actual solo incluye `HealthModule`, `ConfigModule` y `PrismaModule`. No están implementados los módulos/endpoints del contrato MVP (auth, users, workspaces, projects, folders, documents, versions, drafts, diff, merge, shares, notifications, imports, assets).
- Sugerencia: Implementar módulos en el orden de dependencias del dominio (auth → users → workspaces → projects/folders → documents → drafts/versions → diff/merge → shares → notifications/SSE → imports/assets) respetando el prefijo `/api/v1/` y los DTOs/validaciones definidos en `Versionly_Spec_Backend.md`.
- Referencias: Versionly_API_Contrato_Base.md, Versionly_Spec_Backend.md, Versionly_Estructura_Backend.md

### INC-0005 — Prisma schema/migrations faltantes en el repo
- Fecha: 2026-02-22 10:38
- Tipo: Diseño
- Severidad: Alta
- Área: Datos
- Estado: Resuelto
- Impacto: Técnico
- Descripción: El repo no contiene `backend/prisma/schema.prisma` ni migraciones. Se declara `@prisma/client` pero no existe fuente de verdad de schema en el backend para generar el client y ejecutar migraciones.
- Sugerencia: Crear `backend/prisma/schema.prisma` basado en `Versionly_Schema_MySQL.sql`, generar Prisma Client y agregar scripts de migración/seed para ambientes locales.
- Referencias: Versionly_Schema_MySQL.sql, Versionly_Spec_Backend.md, backend/package.json

### INC-0006 — Respuesta estándar de API no aplicada
- Fecha: 2026-02-22 10:38
- Tipo: Diseño
- Severidad: Media
- Área: API
- Estado: Resuelto
- Impacto: Técnico
- Descripción: La spec define un envelope estándar `{ success, data, meta }` para respuestas y `{ success:false, error:{...} }` para errores. El endpoint `/api/v1/health` actualmente responde un objeto plano `{ status, timestamp }`.
- Sugerencia: Implementar interceptor global de transformación de respuestas y filtros de excepciones (HTTP/Prisma) según `Versionly_Spec_Backend.md`. Ajustar `/health` al formato estándar.
- Referencias: Versionly_Spec_Backend.md, backend/src/modules/health/health.controller.ts

### INC-0007 — Swagger/OpenAPI no configurado
- Fecha: 2026-02-22 10:38
- Tipo: Operación
- Severidad: Media
- Área: Backend
- Estado: Resuelto
- Impacto: Técnico
- Descripción: La spec indica documentación Swagger/OpenAPI (por ejemplo en `/api/docs`) pero no hay configuración en `main.ts` ni dependencia registrada.
- Sugerencia: Agregar `@nestjs/swagger` y configurar Swagger en desarrollo, documentando el contrato real implementado.
- Referencias: Versionly_Spec_Backend.md, backend/src/main.ts

### INC-0008 — Incompatibilidad de versiones TypeScript vs ESLint (warning)
- Fecha: 2026-02-22 10:40
- Tipo: Dependencias
- Severidad: Media
- Área: Backend
- Estado: Resuelto
- Impacto: Técnico
- Descripción: El lint advierte que TypeScript 5.9.3 no está soportado oficialmente por `@typescript-eslint/typescript-estree` (rango soportado `<5.6.0`). Puede producir falsos positivos/negativos y fallas sutiles en análisis estático.
- Sugerencia: Alinear versiones: fijar TypeScript a `~5.5.x` (según stack) o actualizar el set de `@typescript-eslint/*` a uno compatible con TS 5.9.
- Referencias: backend/package.json, salida de `npm --prefix backend run lint`

### INC-0009 — Frontend sin Tailwind pese a la spec
- Fecha: 2026-02-22 11:20
- Tipo: Incongruencia
- Severidad: Media
- Área: Frontend
- Estado: Resuelto
- Impacto: Técnico
- Descripción: La especificación frontend indica Tailwind CSS 3, pero el bootstrap inicial del frontend se generó sin configuración de Tailwind.
- Sugerencia: Configurar Tailwind CSS 3 en el frontend o ajustar la spec para reflejar CSS nativo.
- Referencias: Versionly_Spec_Frontend.md, frontend/package.json

[2026-02-23 10:15] Incongruencia | Media | API | Resuelto | Ruta de borrado de assets no coincide con contrato (/assets/:assetId vs /documents/:docId/assets/:assetId) | Ajustar endpoint a /assets/:assetId y validar acceso por documento
[2026-02-23 10:15] Incongruencia | Media | Backend | Resuelto | Roles de acceso en GET draft y list assets no alineados con contrato | Limitar GET draft a editor y permitir list assets a viewer/editor
[2026-02-23 11:05] Incongruencia | Media | API | Resuelto | Ruta pública de shares no coincide con contrato (/public/:token vs /shares/:token) | Ajustar endpoint a /public/:token
[2026-02-23 11:05] Incongruencia | Media | API | Resuelto | Métodos de notificaciones no coinciden con contrato (PATCH vs POST) | Cambiar /notifications/:id/read y /notifications/read-all a PATCH
[2026-02-24 10:30] Operación | Alta | Datos | Pendiente | Error en lectura de documento por tabla shared_links inexistente en BD | Ejecutar migraciones/crear tabla shared_links según schema y regenerar Prisma Client
[2026-02-24 03:17] Operación | Alta | Backend | Pendiente | Error MySQL 1442 al crear versión (document_versions en trigger/función que vuelve a tocar la misma tabla) | Remover actualización en trigger sobre document_versions y mover set-current a la capa de aplicación en transacción secuencial (crear versión -> actualizar documento.currentVersionId)
