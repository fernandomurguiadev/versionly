# Versionly — Estructura Frontend (Angular)
**Versión 1.1 · Febrero 2026**

---

## 1. Estructura sugerida
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── store/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   ├── layout/
│   │   │   ├── app-layout/
│   │   │   ├── auth-layout/
│   │   │   └── public-layout/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── onboarding/
│   │   │   ├── workspaces/
│   │   │   ├── settings/
│   │   │   ├── projects/
│   │   │   ├── folders/
│   │   │   ├── documents/
│   │   │   ├── editor/
│   │   │   ├── versions/
│   │   │   ├── diff/
│   │   │   ├── merge/
│   │   │   ├── shares/
│   │   │   ├── public/
│   │   │   ├── notifications/
│   │   │   ├── imports/
│   │   │   └── errors/
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   ├── environments/
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

## 2. Responsabilidades por feature
- auth: login, registro, verificación y reset.
- onboarding: creación inicial guiada.
- workspaces: selector y administración.
- settings: miembros, perfil y configuración.
- projects: lista y navegación.
- folders: estructura de carpetas.
- documents: CRUD y permisos.
- editor: TipTap y borrador activo.
- versions: historial y Versión Actual.
- diff: vista comparativa.
- merge: resolución de conflictos.
- shares: generación de links.
- public: vista pública sin auth.
- notifications: feed y SSE.
- imports: carga y feedback de `.docx`.
- errors: estados 401/403/404/500.
