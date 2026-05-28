# Versionly — Estructura Frontend (Next.js 15)
**Versión 1.1 · Febrero 2026**

---

## 1. Estructura sugerida

> **Nota:** el stack fue migrado de Angular 19 a **Next.js 15 App Router**. La estructura refleja las convenciones del App Router: cada carpeta bajo `app/` puede contener un `page.tsx`, `layout.tsx` y `loading.tsx`. Los grupos de rutas entre paréntesis `(grupo)` no generan segmento de URL.

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (public)/
│   │   └── share/
│   │       └── [token]/
│   │           └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                  ← app shell: sidebar + topbar
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── (features)/
│   │   │   ├── workspaces/
│   │   │   │   └── [workspaceId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── projects/
│   │   │   │       │   └── [projectId]/
│   │   │   │       │       └── folders/
│   │   │   │       │           └── [folderId]/
│   │   │   │       │               └── page.tsx
│   │   │   │       └── settings/
│   │   │   │           ├── page.tsx
│   │   │   │           ├── members/
│   │   │   │           │   └── page.tsx
│   │   │   │           └── connected-accounts/        ← [v1.1]
│   │   │   │               └── page.tsx               ← gestionar cuentas Google conectadas al workspace
│   │   │   ├── documents/
│   │   │   │   └── [documentId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── editor/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── versions/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── diff/
│   │   │   │           └── page.tsx
│   │   │   ├── imports/
│   │   │   │   └── page.tsx                           ← tabs: "Subir archivo" + "Desde Google Drive" [v1.1]
│   │   │   ├── integrations/                          ← [v1.1] Google Drive OAuth2
│   │   │   │   └── google-drive/
│   │   │   │       ├── callback/
│   │   │   │       │   └── page.tsx                   ← maneja redirect OAuth2 de Google
│   │   │   │       ├── components/
│   │   │   │       │   ├── drive-file-picker.tsx      ← modal con lista de archivos Drive
│   │   │   │       │   ├── drive-file-list.tsx        ← listado paginado con búsqueda
│   │   │   │       │   └── connected-account.tsx      ← card de cuenta conectada
│   │   │   │       └── hooks/
│   │   │   │           ├── use-drive-files.ts         ← TanStack Query para listar archivos
│   │   │   │           └── use-drive-connection.ts    ← estado de conexión OAuth
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   └── api/                            ← Route Handlers (Next.js API)
│       └── [...]/
├── components/
│   ├── ui/                             ← shadcn/ui primitivos
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── app-shell.tsx
│   └── shared/
│       ├── version-badge.tsx
│       ├── document-card.tsx
│       └── empty-state.tsx
├── lib/
│   ├── api/                            ← cliente HTTP y funciones de fetch
│   ├── hooks/                          ← hooks globales (useAuth, useWorkspace)
│   ├── stores/                         ← Zustand o Context stores
│   ├── schemas/                        ← esquemas Zod para validación
│   └── utils/
├── public/
│   └── assets/
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

## 2. Responsabilidades por feature

- **(auth):** login, registro, verificación y reset. Server Actions para submit de formularios.
- **onboarding:** wizard de 3 pasos con estado en URL params.
- **workspaces:** selector y administración de workspace.
- **settings/members:** gestión de miembros e invitaciones (solo Admin).
- **settings/connected-accounts** *(v1.1):* panel de cuentas Google OAuth conectadas al workspace; permite revocar acceso.
- **projects/folders:** estructura de navegación jerárquica.
- **documents:** CRUD y permisos por documento.
- **editor:** TipTap con autoguardado y borrador activo.
- **versions:** historial y Versión Actual.
- **diff:** vista comparativa lado a lado.
- **merge:** resolución de conflictos.
- **shares:** generación de links dinámicos y fijos.
- **(public):** vista pública sin auth por token.
- **notifications:** feed y Server-Sent Events.
- **imports:** tabs para carga de `.docx` y para selección desde Google Drive *(v1.1)*.
- **integrations/google-drive** *(v1.1):* flujo completo de OAuth2 — callback, file picker modal, listado paginado y estado de conexión. El flujo es server-side redirect; no se usa el SDK de Google en el cliente.

## 3. Convenciones Next.js 15 App Router

- Los **Server Components** son el default; marcar `"use client"` solo cuando se requiere estado o efectos del browser.
- Los formularios usan **React Hook Form + Zod** para validación en cliente; la mutación se realiza mediante **TanStack Query** (`useMutation`) contra la API REST del backend.
- El data fetching asíncrono en componentes del servidor usa `fetch` con `cache` y `revalidate` según el caso.
- Las **rutas paralelas** y **intercepting routes** de Next.js se usan para modales que deben ser navegables (ej: drive file picker abierto desde `/imports` mantiene la URL previa).
- Las variables de entorno del lado cliente se prefijan con `NEXT_PUBLIC_`.
