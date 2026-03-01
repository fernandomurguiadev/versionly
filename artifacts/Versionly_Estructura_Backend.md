# Versionly — Estructura Backend (NestJS)
**Versión 1.1 · Febrero 2026**

---

## 1. Estructura sugerida
```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── decorators/
│   │   └── types/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── workspaces/
│   │   ├── invitations/
│   │   ├── projects/
│   │   ├── folders/
│   │   ├── documents/
│   │   ├── assets/
│   │   ├── drafts/
│   │   ├── versions/
│   │   ├── merge/
│   │   ├── diff/
│   │   ├── shares/
│   │   ├── notifications/
│   │   ├── imports/
│   │   └── health/
│   └── integrations/
│       ├── prisma/
│       ├── redis/
│       ├── storage/
│       ├── sse/
│       └── email/
├── test/
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 2. Responsabilidades por módulo
- auth: registro, login, refresh, logout, verificación y reset.
- users: perfil y seguridad del usuario.
- workspaces: membresías, roles y configuración.
- invitations: invitaciones por email y aceptación.
- projects: proyectos por workspace.
- folders: carpetas por proyecto.
- documents: CRUD y permisos de documentos.
- assets: imágenes y uploads del editor.
- drafts: borrador activo por documento.
- versions: guardado, historial y Versión Actual.
- merge: resolución de conflictos y trazabilidad.
- diff: cálculo y resumen de cambios.
- shares: links fijos/dinámicos y revocación.
- notifications: feed y SSE.
- imports: pipeline `.docx` e import_warnings.
- health: estado del servidor.
