# Versionly — Especificación Técnica Frontend
**Stack: Angular 19 · NgRx SignalStore · TipTap 2 (planificado) · Tailwind CSS 3**
**Metodología: Spec-Driven Development · Versión 1.0 · Febrero 2026**

---

## Índice

1. [Validación y corrección de la estructura propuesta](#1-validación-y-corrección-de-la-estructura-propuesta)
2. [Estructura final corregida](#2-estructura-final-corregida)
3. [Convenciones globales](#3-convenciones-globales)
4. [Arquitectura de rutas](#4-arquitectura-de-rutas)
5. [Gestión de estado (NgRx SignalStore)](#5-gestión-de-estado-ngrx-signalstore)
6. [Especificación por feature](#6-especificación-por-feature)
7. [Capas transversales (core)](#7-capas-transversales-core)
8. [Componentes compartidos (shared)](#8-componentes-compartidos-shared)
9. [Integración con el editor TipTap](#9-integración-con-el-editor-tiptap)
10. [Notificaciones SSE](#10-notificaciones-sse)
11. [Testing](#11-testing)

---

## 1. Validación y corrección de la estructura propuesta

### ✅ Lo que está bien

- Separación en `core/`, `shared/`, `features/` y `layout/` es el patrón correcto para Angular 19 con standalone components.
- `core/guards/` e `core/interceptors/` en posición correcta.
- `features/` alineadas con los módulos del backend.
- `app.config.ts` y `app.routes.ts` a nivel raíz de `app/` es la convención de Angular 19 sin NgModules.

### ❌ Correcciones necesarias

**1. Falta `features/auth/` y `features/onboarding/`**
El mapa de pantallas define 7 pantallas de autenticación y 4 de onboarding. Son features independientes con sus propias rutas y componentes.

**2. Falta `features/settings/`**
Las pantallas SET-01 a SET-05 (settings del workspace, miembros, perfil) no tienen feature asignada.

**3. Falta `features/merge/`**
Las pantallas MRG-01 y MRG-02 requieren su propio feature con componentes especializados.

**4. Falta `features/public/`**
Las pantallas SHR-03/04/05 (vista pública sin autenticación) tienen un layout radicalmente distinto al resto de la app. Mezclarlas con `features/shares/` genera confusión.

**5. `core/state/` sin estructura definida**
Con NgRx SignalStore, el estado global tiene una convención específica. Sin definirla, cada developer lo implementa distinto.

**6. Falta `core/models/`**
Los tipos TypeScript de los DTOs del backend (compartidos entre features) deben vivir en un lugar centralizado, no duplicarse en cada feature.

**7. `layout/` necesita sub-estructura**
Hay dos layouts distintos: el layout principal de la app (sidebar + header) y el layout público (sin nav, minimal). Sin diferenciarlos en la estructura de carpetas, los componentes se mezclan.

**8. Falta `features/errors/`**
Las páginas ERR-01 a ERR-04 son rutas independientes, no componentes inline.

---

## 2. Estructura final corregida

```
frontend/
├── src/
│   ├── app/
│   │   │
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts          # login, register, refresh, logout
│   │   │   │   ├── token.service.ts         # storage y gestión de tokens
│   │   │   │   └── auth.store.ts            # SignalStore del estado de sesión
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts            # redirige a /login si no hay sesión
│   │   │   │   ├── verified.guard.ts        # redirige a /verify si email no verificado
│   │   │   │   ├── guest.guard.ts           # redirige a /app si ya hay sesión
│   │   │   │   └── workspace-role.guard.ts  # verifica rol mínimo en workspace
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts      # adjunta Bearer token a cada request
│   │   │   │   ├── refresh.interceptor.ts   # maneja 401 y renueva el token
│   │   │   │   └── error.interceptor.ts     # centraliza errores HTTP en el store
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts           # wrapper de HttpClient con base URL
│   │   │   │   ├── sse.service.ts           # gestión de EventSource global
│   │   │   │   └── notification.service.ts  # bridge SSE → NotificationsStore
│   │   │   ├── models/
│   │   │   │   ├── auth.models.ts
│   │   │   │   ├── workspace.models.ts
│   │   │   │   ├── document.models.ts
│   │   │   │   ├── version.models.ts
│   │   │   │   ├── diff.models.ts
│   │   │   │   ├── share.models.ts
│   │   │   │   └── notification.models.ts
│   │   │   └── store/
│   │   │       ├── app.store.ts             # estado global: workspace activo, error global
│   │   │       └── notifications.store.ts   # contador + feed de notificaciones
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── input/
│   │   │   │   ├── modal/
│   │   │   │   ├── dropdown/
│   │   │   │   ├── badge/
│   │   │   │   ├── avatar/
│   │   │   │   ├── spinner/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── toast/
│   │   │   │   └── page-error/
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.directive.ts
│   │   │   │   └── autofocus.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── time-ago.pipe.ts
│   │   │   │   └── file-size.pipe.ts
│   │   │   └── utils/
│   │   │       ├── date.utils.ts
│   │   │       └── clipboard.utils.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── app-layout/
│   │   │   │   ├── app-layout.component.ts  # sidebar + header + router-outlet
│   │   │   │   ├── sidebar/
│   │   │   │   │   └── sidebar.component.ts # nav: workspaces, proyectos, notif
│   │   │   │   └── header/
│   │   │   │       └── header.component.ts  # workspace switcher, notif bell, avatar
│   │   │   ├── auth-layout/
│   │   │   │   └── auth-layout.component.ts # centrado, sin nav
│   │   │   └── public-layout/
│   │   │       └── public-layout.component.ts # minimal, sin sidebar
│   │   │
│   │   ├── features/
│   │   │   ├── auth/                        # [NEW] AUTH-01 a AUTH-07
│   │   │   ├── onboarding/                  # [NEW] ON-01 a ON-04
│   │   │   ├── workspaces/                  # WS-01 a WS-06
│   │   │   ├── settings/                    # [NEW] SET-01 a SET-05
│   │   │   ├── projects/                    # vistas de proyecto
│   │   │   ├── folders/                     # vistas de carpeta
│   │   │   ├── documents/                   # DOC-01 a DOC-06
│   │   │   ├── editor/                      # ED-01 a ED-09
│   │   │   ├── versions/                    # panel historial + vistas
│   │   │   ├── diff/                        # CMP-01 a CMP-03
│   │   │   ├── merge/                       # [NEW] MRG-01 a MRG-02
│   │   │   ├── shares/                      # SHR-01 a SHR-02
│   │   │   ├── public/                      # [NEW] SHR-03 a SHR-05 (sin auth)
│   │   │   ├── notifications/               # NOT-01 a NOT-05
│   │   │   ├── imports/                     # IMP-01 a IMP-05
│   │   │   └── errors/                      # [NEW] ERR-01 a ERR-04
│   │   │
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   │   ├── icons/
│   │   └── fonts/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.production.ts
│   └── styles.css                           # Tailwind directives
│
├── angular.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## 3. Convenciones globales

- Todas las vistas deben ser completamente responsivas siguiendo un enfoque mobile first.

### 3.1 Standalone components (Angular 19)

Todos los componentes son standalone. No hay NgModules. Las dependencias se declaran en el array `imports` de cada componente.

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, RouterModule, ...],
  templateUrl: './example.component.html',
})
```

### 3.2 Señales (Signals) para estado local

Estado local de componentes usa `signal()` y `computed()` de Angular. No se usa `BehaviorSubject` para estado local.

### 3.3 Nomenclatura de archivos

```
[nombre].component.ts / .html / .css
[nombre].service.ts
[nombre].store.ts        # SignalStore
[nombre].guard.ts
[nombre].interceptor.ts
[nombre].models.ts       # interfaces e types
[nombre].routes.ts       # rutas lazy del feature
```

### 3.4 Estructura interna de cada feature

```
feature-name/
  components/
    [feature-name]-page/         # componente de página (routable)
    [nombre-modal]/
    [nombre-panel]/
  services/
    [feature-name].service.ts    # llama al ApiService, retorna Observables
  store/
    [feature-name].store.ts      # SignalStore
  [feature-name].routes.ts       # rutas lazy
```

### 3.5 Comunicación entre capas

```
Component → Store → Service → ApiService → Backend
                ↑
           (señales reactivas)
```

Los componentes leen del store mediante `computed()`. Disparan acciones del store para side effects. El store llama al service. El service llama a `ApiService`.

### 3.6 Manejo de errores HTTP

El `ErrorInterceptor` captura errores HTTP y los rutea:
- `401` → intenta refresh. Si falla → logout y redirige a `/login`.
- `403` → navega a `/error/forbidden`.
- `404` → navega a `/error/not-found`.
- `500` → emite al `AppStore.setGlobalError()` y muestra toast.

---

## 4. Arquitectura de rutas

```typescript
// app.routes.ts
[
  // Layout de autenticación
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login',    loadChildren: () => import('./features/auth/auth.routes') },
      { path: 'register', loadChildren: () => import('./features/auth/auth.routes') },
      { path: 'verify',   loadChildren: () => import('./features/auth/auth.routes') },
      { path: 'reset',    loadChildren: () => import('./features/auth/auth.routes') },
    ]
  },

  // Onboarding (sin sidebar)
  {
    path: 'onboarding',
    canActivate: [authGuard, verifiedGuard],
    loadChildren: () => import('./features/onboarding/onboarding.routes')
  },

  // App principal
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard, verifiedGuard],
    children: [
      { path: '', redirectTo: 'workspaces', pathMatch: 'full' },
      { path: 'workspaces',                       loadChildren: () => import('./features/workspaces/workspaces.routes') },
      { path: 'workspaces/:wsId/settings',        loadChildren: () => import('./features/settings/settings.routes') },
      { path: 'workspaces/:wsId/projects',        loadChildren: () => import('./features/projects/projects.routes') },
      { path: 'projects/:projectId/folders',      loadChildren: () => import('./features/folders/folders.routes') },
      { path: 'folders/:folderId/documents',      loadChildren: () => import('./features/documents/documents.routes') },
      { path: 'documents/:docId/edit',            loadChildren: () => import('./features/editor/editor.routes') },
      { path: 'documents/:docId/compare',         loadChildren: () => import('./features/diff/diff.routes') },
      { path: 'documents/:docId/merge',           loadChildren: () => import('./features/merge/merge.routes') },
      { path: 'profile',                          loadChildren: () => import('./features/settings/settings.routes') },
    ]
  },

  // Vista pública (sin auth, layout minimal)
  {
    path: 's/:token',
    component: PublicLayoutComponent,
    loadChildren: () => import('./features/public/public.routes')
  },

  // Errores
  {
    path: 'error',
    loadChildren: () => import('./features/errors/errors.routes')
  },

  { path: '**', redirectTo: '/error/not-found' }
]
```

---

## 5. Gestión de estado (NgRx SignalStore)

### 5.1 AppStore (global)

```typescript
// core/store/app.store.ts
State: {
  activeWorkspaceId: string | null
  activeWorkspace: WorkspaceDto | null
  globalError: string | null
  isLoading: boolean
}
Computed: {
  hasActiveWorkspace: boolean
}
Actions: {
  setActiveWorkspace(workspace: WorkspaceDto)
  clearActiveWorkspace()
  setGlobalError(message: string)
  clearGlobalError()
}
```

### 5.2 AuthStore

```typescript
// core/auth/auth.store.ts
State: {
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
Computed: {
  userId: string | null
  isEmailVerified: boolean
}
Actions: {
  login(dto) → llama AuthService, guarda tokens, carga user
  register(dto) → llama AuthService
  logout() → llama AuthService, limpia estado y tokens
  loadCurrentUser() → llama GET /users/me
  refreshToken() → llamado por RefreshInterceptor
}
```

### 5.3 NotificationsStore

```typescript
// core/store/notifications.store.ts
State: {
  notifications: NotificationDto[]
  unreadCount: number
  isOpen: boolean
}
Computed: {
  hasUnread: boolean
  groupedByDocument: Map<string, NotificationDto[]>
}
Actions: {
  loadNotifications()
  markRead(id: string)
  markAllRead()
  addFromSSE(notification: NotificationDto)   # llamado por SseService
  toggle()
}
```

### 5.4 Stores por feature (patrón)

Cada feature tiene su propio store. Ejemplo para `documents`:

```typescript
// features/documents/store/documents.store.ts
State: {
  documents: DocumentDto[]
  selectedDocument: DocumentDto | null
  isLoading: boolean
  error: string | null
  currentFolderId: string | null
}
Computed: {
  documentsCount: number
  isEmpty: boolean
}
Actions: {
  loadDocuments(folderId: string)
  createDocument(folderId: string, dto: CreateDocumentDto)
  deleteDocument(id: string)
  selectDocument(id: string)
}
```

Stores requeridos: `AuthStore`, `AppStore`, `NotificationsStore`, `WorkspacesStore`, `DocumentsStore`, `VersionsStore`, `EditorStore`, `DiffStore`, `SharesStore`.

---

## 6. Especificación por feature

---

### 6.1 Feature: `auth`

**Rutas:** `/login`, `/register`, `/verify`, `/verify/success`, `/reset`, `/reset/token/:token`

**Componentes:**
- `LoginPageComponent` — formulario reactivo con `email` y `password`. Al submit llama `AuthStore.login()`. Redirige a `/app` si tiene éxito. Si `403 EMAIL_NOT_VERIFIED` → redirige a `/verify`.
- `RegisterPageComponent` — formulario con `full_name`, `email`, `password`, `confirmPassword`. Validación de contraseña match en el cliente. Al submit → `AuthStore.register()` → redirige a `/verify`.
- `VerifyEmailPageComponent` — muestra instrucción de revisar correo. Botón "Reenviar" con cooldown de 60 segundos (signal con `setInterval`). Detecta query param `?verified=true` para mostrar pantalla de éxito.
- `ForgotPasswordPageComponent` — campo email. Submit → POST `/auth/forgot-password`. Muestra mensaje de confirmación igual independientemente de si el email existe.
- `ResetPasswordPageComponent` — lee `token` de query params. Formulario nueva contraseña + confirmación. Submit → POST `/auth/reset-password`. Si token inválido → renderiza `AuthErrorComponent`.
- `AuthErrorComponent` — shared entre token inválido y link expirado. Props: `{ message, ctaLabel, ctaRoute }`.

**Guards:**
- `guestGuard`: si el usuario está autenticado, redirige a `/app`.
- `authGuard`: si no está autenticado, redirige a `/login` guardando la URL actual en `redirectUrl`.
- `verifiedGuard`: si el email no está verificado, redirige a `/verify`.

---

### 6.2 Feature: `onboarding`

**Ruta:** `/onboarding`

**Componentes:**
- `OnboardingShellComponent` — wizard container. Mantiene `currentStep` como signal. Muestra barra de progreso (steps 1-4). No permite ir atrás en steps 1 y 2.
- `OnboardingStep1Component` — campo nombre del workspace. Submit → crea workspace → avanza a step 2.
- `OnboardingStep2Component` — campo nombre del proyecto. Submit → crea proyecto en el workspace recién creado → avanza a step 3.
- `OnboardingStep3Component` — campo nombre de carpeta. Submit → crea carpeta. Botón "Saltar" disponible.
- `OnboardingStep4Component` — dos CTAs: "Crear documento" y "Importar documento". Ambos son salteables. Al completar → redirige a `/app/workspaces`.

**Lógica:** al completar el onboarding, setea el workspace recién creado como activo en `AppStore`.

---

### 6.3 Feature: `workspaces`

**Rutas:** `/app/workspaces`, `/app/workspaces/:wsId`

**Componentes:**
- `WorkspaceSwitcherComponent` — dropdown en el header. Lista workspaces del usuario. Botón "Nuevo workspace" abre `CreateWorkspaceModalComponent`. Seleccionar workspace → `AppStore.setActiveWorkspace()` + navega a `/app/workspaces/:wsId`.
- `WorkspaceHomePageComponent` — grid de proyectos recientes (máximo 6) + lista de documentos modificados recientemente (máximo 10). Cada ítem con nombre, fecha y autor.
- `ProjectsListPageComponent` — lista/grid de proyectos. Búsqueda en tiempo real (debounce 300ms, FULLTEXT en backend). Botón "Nuevo proyecto" si es Admin.
- `CreateWorkspaceModalComponent` — campo nombre. Submit → `WorkspacesStore.create()`.
- `CreateProjectModalComponent` — campo nombre. Submit → `ProjectsStore.create()`.

---

### 6.4 Feature: `settings`

**Rutas:** `/app/workspaces/:wsId/settings`, `/app/profile`

**Componentes:**
- `WorkspaceSettingsPageComponent` — layout de dos columnas: nav lateral (General, Miembros) + área de contenido.
- `WorkspaceGeneralComponent` — campo nombre editable. Botón "Guardar". Zona de peligro: botón "Eliminar workspace" → abre `ConfirmDestructiveModalComponent` con campo de confirmación por texto.
- `WorkspaceMembersComponent` — tabla de miembros: avatar, nombre, email, rol (dropdown editable si Admin), botón "Remover". Botón "Invitar miembro" → abre `InviteMemberModalComponent`.
- `InviteMemberModalComponent` — campo email + select rol (Editor/Viewer). Submit → POST `/workspaces/:wsId/invitations`.
- `TransferAdminModalComponent` — aparece cuando el único Admin intenta remover su propio rol o salir del workspace. Select de miembro a promover + confirmación.
- `UserProfilePageComponent` — campos: nombre (editable), email (solo lectura), formulario cambio de contraseña (contraseña actual + nueva + confirmación). Botón "Cerrar sesión en todos los dispositivos".

---

### 6.5 Feature: `documents`

**Ruta:** `/app/folders/:folderId/documents`

**Componentes:**
- `DocumentsListPageComponent` — lista de documentos de la carpeta. Cada fila muestra: título, badge "Versión Actual" con nombre de la versión, autor, fecha de modificación, menú de acciones (DOC-04). Filtros: búsqueda por nombre (debounce 300ms), ordenar por fecha creación/modificación.
- `DocumentCardComponent` — card individual con la información anterior. Emite eventos `(open)`, `(action)`.
- `CreateDocumentModalComponent` — campo título. Submit → `DocumentsStore.create()` → navega directamente al editor.
- `DocumentActionsMenuComponent` — dropdown con: Renombrar (inline edit), Mover a carpeta (modal selector), Gestionar acceso, Eliminar (solo Admin).
- `DocumentAccessModalComponent` — DOC-05. Lista de miembros con acceso. Toggle `can_view_history`. Buscar y añadir usuarios. Solo Editor y Admin.
- `EmptyFolderComponent` — empty state con dos CTAs: "Crear documento" e "Importar documento".

---

### 6.6 Feature: `editor`

**Ruta:** `/app/documents/:docId/edit`

Esta es la pantalla más compleja. Se divide en zonas claramente definidas.

**Componentes:**
- `EditorPageComponent` — layout de tres columnas: panel lateral izquierdo (historial, colapsable), área central (editor TipTap), sin panel derecho en MVP.
- `EditorToolbarComponent` — barra superior: título editable inline, indicador de autoguardado (`Guardado`, `Guardando...`, `Error al guardar`), botón "Guardar Versión", botón "Compartir", menú de acciones del documento.
- `TiptapEditorComponent` — ver sección 9 (Integración TipTap). Recibe `content` como input, emite `(contentChange)` en cada cambio.
- `AutosaveIndicatorComponent` — muestra el estado del autoguardado como signal: `idle | saving | saved | error`.
- `SaveVersionModalComponent` — ED-02. Formulario: `versionName` (required), `comment` (optional), checkbox `markAsCurrent`. Submit → `VersionsStore.saveVersion()`.
- `ConflictBannerComponent` — ED-03. Aparece cuando `VersionsStore.hasConflict()` es true. Botón "Ver conflicto" → navega a `/app/documents/:docId/merge`.
- `VersionHistoryPanelComponent` — ED-04. Panel lateral colapsable. Lista de versiones como `VersionHistoryItemComponent`. Cada ítem: nombre, autor, fecha, badge "Versión Actual". Click → abre `VersionViewerComponent`.
- `VersionViewerComponent` — ED-05. Overlay fullscreen. Muestra contenido de la versión en modo lectura (TipTap en modo `editable: false`). Botones: "Marcar como Versión Actual", "Comparar con...", cerrar.
- `MarkAsCurrentModalComponent` — ED-06. Confirmación. Muestra nombre de la versión que quedará como actual.
- `DeleteDraftVersionModalComponent` — ED-07. Confirmación simple.
- `DeleteCurrentVersionModalComponent` — ED-08. Confirmación destructiva. Lista los links activos que quedarán rotos. Campo de texto para confirmar.

**Store: `EditorStore`**
```
State: {
  document: DocumentDto | null
  draft: DraftDto | null
  versions: VersionListItemDto[]
  currentVersion: VersionResponseDto | null
  hasConflict: boolean
  conflictVersions: [VersionListItemDto, VersionListItemDto] | null
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  isHistoryPanelOpen: boolean
}
Actions: {
  loadDocument(docId)
  loadDraft(docId)
  saveDraft(docId, content)       # llamado por autoguardado
  saveVersion(docId, dto)
  setCurrent(versionId)
  loadVersions(docId)
  selectVersion(versionId)
  checkConflicts(docId)
}
```

**Autoguardado:**
El `TiptapEditorComponent` emite `(contentChange)` en cada cambio. El `EditorPageComponent` usa `rxjs debounceTime(30_000)` (30 segundos) + `distinctUntilChanged()` para llamar a `EditorStore.saveDraft()`. También se guarda en `beforeunload` del navegador.

---

### 6.7 Feature: `diff`

**Ruta:** `/app/documents/:docId/compare`

**Componentes:**
- `DiffPageComponent` — shell de la pantalla de comparación. Coordina los tres sub-componentes.
- `VersionSelectorComponent` — CMP-01. Dos dropdowns de versión. Por defecto selecciona las dos más recientes. Botón "Comparar" → llama `DiffStore.compute()`.
- `DiffViewComponent` — CMP-02. Recibe el diff calculado. Muestra panel de resumen + vista lado a lado. Toggle para cambiar a vista unificada (CMP-03).
- `DiffSummaryPanelComponent` — barra colapsable con contadores de cambios. Cada ítem clickeable navega al primer cambio de ese tipo.
- `DiffChangeBlockComponent` — renderiza un bloque de cambio individual. Props: `{ type, nodeType, contentA, contentB }`. Aplica clases de color según el tipo.
- `DiffNavigatorComponent` — botones anterior/siguiente. Mantiene `currentChangeIndex` como signal.

**Store: `DiffStore`**
```
State: {
  versionA: VersionListItemDto | null
  versionB: VersionListItemDto | null
  diff: DiffResponseDto | null
  isLoading: boolean
  viewMode: 'side-by-side' | 'unified'
  currentChangeIndex: number
}
Actions: {
  compute(versionAId, versionBId)
  setViewMode(mode)
  navigateChange(direction: 'prev' | 'next')
}
```

---

### 6.8 Feature: `merge`

**Ruta:** `/app/documents/:docId/merge`

**Componentes:**
- `MergePageComponent` — MRG-01. Shell de la pantalla de merge. Carga los pares en conflicto.
- `MergeBlockComponent` — por cada bloque divergente entre versión A y B muestra: contenido de A a la izquierda, contenido de B a la derecha. Botones "Usar A", "Usar B". Si se elige B o A, el bloque colapsa mostrando la elección. Los bloques sin divergencia se muestran como texto común (colapsados).
- `MergeToolbarComponent` — muestra progreso de resolución (N de M bloques resueltos). Botón "Guardar merge" habilitado solo cuando todos los bloques están resueltos.
- `SaveMergeModalComponent` — MRG-02. Campo nombre (pre-relleno), comentario, checkbox "Marcar como Versión Actual". Submit → `MergeStore.save()`.

**Store: `MergeStore`**
```
State: {
  versionA: VersionListItemDto | null
  versionB: VersionListItemDto | null
  blocks: MergeBlock[]       # cada bloque tiene: content_a, content_b, chosen: 'a'|'b'|'custom'|null
  resolvedCount: number
  isSaving: boolean
}
Computed: {
  isFullyResolved: boolean   # resolvedCount === blocks.length
  mergedContent: ProseMirrorDoc  # construido desde los bloques resueltos
}
Actions: {
  loadConflict(docId)
  chooseBlock(blockIndex, choice)
  save(docId, dto)
}
```

---

### 6.9 Feature: `shares`

**Componentes (modales, no páginas):**
- `ShareDocumentModalComponent` — SHR-01. Dos pestañas: "Link dinámico" y "Link fijo". Para link fijo: dropdown selector de versión + toggle "Permitir ver historial". Botón "Generar link" → POST `/documents/:docId/shares`. Muestra el link generado con botón "Copiar".
- `ActiveLinksComponent` — SHR-02. Lista de links del documento. Columnas: tipo, apunta a, fecha, estado. Botón "Revocar" con confirmación.

---

### 6.10 Feature: `public`

**Ruta:** `/s/:token` (layout: `PublicLayoutComponent`)

Esta feature no tiene autenticación. El `PublicLayoutComponent` es minimal: solo header con el nombre de Versionly y el título del documento.

**Componentes:**
- `PublicDocumentPageComponent` — resuelve el token (GET `/api/v1/public/:token`). Según la respuesta renderiza:
  - Versión encontrada → `PublicDocumentViewComponent`
  - Link revocado o versión eliminada → `PublicUnavailableComponent` (SHR-05)
- `PublicDocumentViewComponent` — SHR-03/04. TipTap en modo `editable: false`. Badge que indica si es Versión Actual o versión archivada. Banner "Esta es una versión archivada" si `mode = 'fixed'` y la versión no es `is_current`. Si `allow_history = true`: muestra panel colapsable de historial de versiones en solo lectura.
- `PublicUnavailableComponent` — SHR-05. Mensaje claro sin exponer ningún dato del documento.

---

### 6.11 Feature: `notifications`

**Componentes:**
- `NotificationBellComponent` — icono en el header. Badge con `NotificationsStore.unreadCount`. Click abre `NotificationFeedComponent` como dropdown/drawer.
- `NotificationFeedComponent` — NOT-01. Lista cronológica de notificaciones. Botón "Marcar todas como leídas". Agrupadas por documento si hay más de 3 del mismo. Cada item muestra: icono por tipo, texto descriptivo, tiempo relativo (pipe `timeAgo`), indicador de no leída (punto azul).
- `NotificationItemComponent` — NOT-02/03/04. Click → `markRead(id)` + navega al destino según el tipo.
- `EmptyNotificationsComponent` — NOT-05.

---

### 6.12 Feature: `imports`

**Componentes (flujo modal multi-paso):**
- `ImportDocumentModalComponent` — shell del flujo. Mantiene `step: Signal<1|2|3|'error'>`.
  - Step 1 → `ImportUploadComponent` (IMP-01): zona drag & drop + selector. Valida tipo y tamaño en el cliente antes de subir.
  - Step 2 → `ImportProgressComponent` (IMP-02): spinner animado. No se puede cerrar el modal. Escucha la respuesta del POST.
  - Step 3 → `ImportResultComponent` (IMP-03): muestra documento creado. Si `warnings.length > 0` → muestra `ImportWarningsComponent` colapsable. Botón "Abrir en editor".
- `ImportWarningsComponent` (IMP-04): lista de advertencias con explicación. Link "¿Por qué?" abre tooltip o expand inline.
- `ImportErrorComponent` (IMP-05): mensaje de error. Botón "Intentar de nuevo" → vuelve al step 1.

---

### 6.13 Feature: `errors`

**Rutas:** `/error/not-found`, `/error/forbidden`, `/error/invitation-invalid`

**Componentes:**
- `NotFoundPageComponent` — ERR-01. 404.
- `ForbiddenPageComponent` — ERR-02. 403.
- `InvitationInvalidPageComponent` — ERR-03. Token expirado o inválido.
- `WorkspaceDeletedPageComponent` — ERR-04.

Todos extienden `PageErrorComponent` (shared) con props: `{ icon, title, description, ctaLabel, ctaRoute }`.

---

## 7. Capas transversales (core)

### 7.1 `ApiService`

Wrapper de `HttpClient`. Expone métodos tipados: `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`. Agrega el prefijo base URL desde `environment.apiUrl`. Deserializa el envelope estándar extrayendo `data`.

### 7.2 `AuthInterceptor`

Intercepta todas las requests. Si existe un access token en `TokenService`, agrega `Authorization: Bearer {token}`. No agrega el header en las rutas públicas de auth (`/auth/login`, `/auth/register`, etc.).

### 7.3 `RefreshInterceptor`

Intercepta respuestas `401`. Llama a `AuthStore.refreshToken()`. Si el refresh es exitoso, reintenta la request original con el nuevo token. Si falla → llama `AuthStore.logout()`.

### 7.4 `TokenService`

Gestiona el almacenamiento de tokens. El access token se guarda en memoria (variable en el service, no en localStorage). El refresh token se guarda en `localStorage` con clave `versionly_rt`. Expone: `getAccessToken()`, `setAccessToken()`, `getRefreshToken()`, `setRefreshToken()`, `clearAll()`.

### 7.5 `SseService`

```typescript
// core/services/sse.service.ts
connect(userId: string): void
  // Abre EventSource en /api/v1/notifications/stream
  // Maneja reconexión automática con backoff exponencial (1s, 2s, 4s, máximo 30s)
  // En cada mensaje → llama NotificationsStore.addFromSSE()

disconnect(): void
  // Cierra el EventSource

isConnected: Signal<boolean>
```

El `SseService` se conecta cuando el usuario inicia sesión y se desconecta en logout. Se reconecta automáticamente si la conexión cae.

---

## 8. Componentes compartidos (shared)

### `ModalComponent`
Props: `{ isOpen, title, size: 'sm'|'md'|'lg'|'fullscreen' }`. Emite `(close)`. Usa Angular CDK Overlay para el backdrop. Animación de entrada/salida con CSS transitions.

### `ConfirmDialogComponent`
Props: `{ title, description, confirmLabel, variant: 'default'|'destructive', requireTextConfirmation?: string }`. Emite `(confirmed)` y `(cancelled)`. La variante `destructive` aplica color rojo al botón de confirmación.

### `EmptyStateComponent`
Props: `{ icon, title, description, ctaLabel?, ctaAction? }`. CTA opcional llama a `ctaAction()` o navega si se provee `ctaRoute`.

### `BadgeComponent`
Props: `{ label, variant: 'default'|'success'|'warning'|'danger'|'info' }`.

### `ToastComponent`
Singleton gestionado por `ToastService`. Apilable (máximo 3 visibles). Auto-dismiss en 4 segundos. Variantes: `success`, `error`, `warning`, `info`.

### `AvatarComponent`
Props: `{ name, size: 'sm'|'md'|'lg' }`. Genera iniciales y color determinístico basado en el nombre.

### `TimeAgoPipe`
Transforma una fecha ISO en texto relativo: "hace 2 minutos", "hace 3 días". Actualización automática con `setInterval` cada 60 segundos usando Angular's `ChangeDetectorRef`.

---

## 9. Integración con el editor TipTap

**Estado actual del editor:** se utiliza un editor `contenteditable` con HTML enriquecido almacenado en `content.html` y un fallback de texto en el JSON. Incluye formato básico y herramientas de fase 2 (listas, enlaces, imágenes, tablas, márgenes, interlineado y espaciado de párrafos). TipTap queda planificado para la siguiente iteración.

### 9.1 Configuración de extensiones

El `TiptapEditorComponent` configura TipTap con las siguientes extensiones para el MVP:

```
Extensiones incluidas:
- StarterKit (sin History — se usa el propio de ProseMirror)
- Heading (levels: [1, 2, 3])
- BulletList + ListItem
- OrderedList
- CodeBlockLowlight (con lowlight y lenguajes: js, ts, python, bash, json, sql, yaml)
- Link (autolink: true, openOnClick: false)
- Image (con upload personalizado)
- Underline
- Strike
- Placeholder ('Comenzá a escribir...')
- CharacterCount
```

### 9.2 Inputs y outputs del componente

```typescript
@Input() content: JSONContent | null    # ProseMirror JSON
@Input() editable: boolean = true       # false para modo lectura
@Input() placeholder: string
@Output() contentChange = new EventEmitter<JSONContent>()
@Output() ready = new EventEmitter<Editor>()
```

### 9.3 Upload de imágenes

Al insertar una imagen (drag & drop o pegar), el componente intercepta el evento antes de que TipTap lo procese:
1. Muestra placeholder de "cargando imagen".
2. Llama `AssetsService.upload(docId, file)`.
3. Al recibir la URL, reemplaza el placeholder con el nodo `image` con `src` definitivo.
4. Si falla → elimina el placeholder y muestra toast de error.

### 9.4 Modo lectura

Cuando `editable = false`, TipTap renderiza el contenido sin cursor ni eventos de edición. Se usa en: ED-05 (vista de versión), SHR-03/04 (vista pública), ED-04 (historial).

### 9.5 Serialización

El JSON de ProseMirror se envía tal cual al backend. No se convierte a HTML para persistencia. La conversión a HTML se hace solo en el frontend para renderizado en vista pública si se necesita.

---

## 10. Notificaciones SSE

### Flujo completo

```
Backend: POST /versions/:id/set-current
  → VersionsService.setCurrent()
  → NotificationsService.create({ type: 'new_current_version', ... })
    → persiste en BD
    → SseService.emit(userId, { type: 'notification', data: NotificationDto })
      → Redis Pub/Sub (si múltiples instancias)
        → todos los servidores emiten a sus conexiones locales

Frontend: SseService (EventSource)
  → recibe mensaje
  → NotificationsStore.addFromSSE(notification)
    → incrementa unreadCount
    → actualiza lista
    → si type === 'save_conflict': muestra toast urgente con link al merge
```

### Reconexión

Si el `EventSource` se desconecta, `SseService` usa backoff exponencial: reintenta a los 1s, 2s, 4s, 8s, 16s, 30s (máximo). Mientras está desconectado, `isConnected` es false y se muestra un indicador sutil en el header.

### Heartbeat

El backend envía un comentario SSE vacío (`:\n\n`) cada 30 segundos para mantener la conexión viva a través de proxies y load balancers.

---

## 11. Testing

### 11.1 Unit tests (Jest)

Un archivo `.spec.ts` por componente y por store. Coverage mínimo obligatorio:

| Módulo | Cobertura |
|---|---|
| AuthStore | 90% |
| EditorStore | 80% |
| DiffStore | 85% |
| MergeStore | 80% |
| TiptapEditorComponent | 70% |
| AutosaveIndicatorComponent | 90% |
| PublicDocumentPageComponent | 85% |
| Todos los guards | 95% |
| Todos los interceptores | 90% |

### 11.2 E2E tests (Playwright)

Flujos obligatorios:

1. **Registro → verificación → onboarding:** el test recibe el token de verificación directamente del backend de test (no de email). Completa los 4 pasos del onboarding.

2. **Editor completo:** crea documento, escribe contenido, espera autoguardado, guarda versión como Versión Actual, verifica que la notificación aparece.

3. **Diff y comparación:** guarda dos versiones con contenido distinto, navega al comparador, verifica que el diff muestra los cambios correctos.

4. **Link público:** genera link dinámico, accede en nueva pestaña sin autenticación, verifica que el contenido es el de la Versión Actual, no incluye datos sensibles.

5. **Conflicto y merge:** dos sesiones paralelas (con Playwright `browser.newContext()`) guardan versiones simultáneamente, verifica banner de conflicto, completa el merge.

### 11.3 Comandos

```bash
npm run test          # unit (Jest)
npm run test:e2e      # E2E (Playwright)
npm run test:cov      # coverage
```
