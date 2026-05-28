# Versionly — Propuesta de Stack Tecnológico
**Frontend · Backend · Infraestructura · DevOps · Versión 1.0 · Febrero 2025**

---

> **Framework frontend:** Angular 19 (confirmado)  
> **Estado:** Pendiente de revisión por equipo técnico  
> **Audiencia:** Equipo de producto y desarrollo

---

## Tabla de Contenidos

1. [Criterios de Selección](#1-criterios-de-selección)
2. [Frontend](#2-frontend)
3. [Backend](#3-backend)
4. [Infraestructura y DevOps](#4-infraestructura-y-devops)
5. [Resumen Ejecutivo del Stack](#5-resumen-ejecutivo-del-stack)
6. [Consideraciones Finales](#6-consideraciones-finales)

---

## 1. Criterios de Selección

Cada tecnología incluida fue evaluada bajo los siguientes criterios, priorizando pragmatismo sobre tendencia y compatibilidad entre capas sobre novedad individual.

- ✅ **Madurez y estabilidad** — versiones estables, amplia adopción y comunidad activa. Sin tecnologías en estado experimental.
- ✅ **Compatibilidad de ecosistema** — las piezas deben integrarse bien entre sí sin fricciones innecesarias.
- ✅ **Curva de aprendizaje razonable** — el equipo no debería necesitar más de 2 semanas para estar productivo en cada tecnología nueva.
- ✅ **Costo operativo controlado** — para MVP se priorizan opciones con tier gratuito o de bajo costo hasta alcanzar escala real.
- ✅ **Escalabilidad futura** — las elecciones del MVP no deben ser callejones sin salida. Cada tecnología debe poder escalar o reemplazarse sin reescribir todo.

---

> **⚠️ Sobre Angular 19: recomendación confirmada con matiz**
>
> Angular 19 es una elección sólida y justificada para este proyecto. Sus ventajas para Versionly:
> - **Standalone components:** ideal para un editor complejo con muchas partes independientes.
> - **Signals (maduros en v19):** gestión de estado reactiva sin boilerplate excesivo.
> - **TypeScript estricto por defecto:** crítico para un dominio con muchas reglas de negocio.
> - **DI nativo:** facilita testeo del editor, diff y servicios de versiones.
>
> Consideración honesta: Angular tiene mayor verbosidad inicial que React o Vue para proyectos pequeños. Para un equipo que ya lo conoce, es la decisión correcta. Si el equipo es nuevo en Angular, vale evaluar si el tiempo de onboarding justifica sus ventajas estructurales.

---

## 2. Frontend

### 2.1 Framework y Lenguaje Base

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🅰️ | **Angular** | v19 latest | Framework principal. Standalone components, Signals para estado reactivo, Router para navegación SPA. | Core |
| TS | **TypeScript** | v5.5+ | Lenguaje base. Tipado estricto en todo el cliente: modelos de versiones, diff, respuestas de API. | Core |
| 🔷 | **RxJS** | v7.x | Programación reactiva para streams de eventos del editor, notificaciones in-app y llamadas HTTP. | Core |

---

### 2.2 Editor de Texto Enriquecido

> Esta es la **decisión técnica más crítica del frontend**. El editor debe generar un formato estructurado (JSON/AST) para que el diff de versiones funcione con precisión a nivel de nodo, no a nivel de HTML raw.

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| ✏️ | **TipTap** | v2.x | Editor principal basado en ProseMirror. Genera JSON estructurado (ProseMirror Document). Extensiones listas para todos los features del MVP: títulos, listas, código, links, imágenes. | Core |
| 🔌 | **TipTap Extensions** | v2.x | Extensiones oficiales: `StarterKit`, `CodeBlockLowlight`, `Image`, `Link`, `Placeholder`, `CharacterCount`. | Core |
| 🎨 | **lowlight** | v3.x | Resaltado de sintaxis en bloques de código. Soporta 190+ lenguajes. Se integra con `CodeBlockLowlight`. | Alta |
| 🔗 | **ngx-tiptap** | latest | Wrapper oficial de TipTap para Angular. Mantiene compatibilidad con el ciclo de vida de Angular. | Core |

**¿Por qué TipTap sobre alternativas?**

| Alternativa | Motivo de descarte |
|---|---|
| Quill.js | Genera HTML como output, lo que complica el diff preciso. |
| Slate.js | Muy flexible pero requiere construir casi todo desde cero. Alto costo de desarrollo. |
| CKEditor 5 | Licencia comercial para features avanzados y output HTML. |
| ProseMirror directo | Máximo control pero altísima complejidad. TipTap es su abstracción correcta. |

TipTap gana porque: output JSON estructurado nativo, extensiones oficiales para todos los features necesarios, licencia MIT, y wrapper Angular disponible y mantenido.

---

### 2.3 Diff y Comparación Visual

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🔍 | **diff-match-patch** | v1.0.x | Motor de diff a nivel de texto/caracteres. Implementación de Google, algoritmo Myers. Calcula los deltas entre dos versiones del documento. | Core |
| 🌳 | **json-diff / custom** | latest | Diff a nivel de nodos del AST de ProseMirror. Compara el JSON estructurado para identificar bloques añadidos, eliminados o modificados. | Alta |
| 🎨 | **Componente custom Angular** | — | Renderizador del diff visual (verde/rojo/azul) implementado como componente Angular sobre los datos del diff engine. | Media |

---

### 2.4 Gestión de Estado

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 📡 | **Angular Signals** | v19 nativo | Estado local de componentes: estado del editor, versión activa, panel de diff, notificaciones. Sin dependencias externas. | Core |
| 🗃️ | **NgRx** | v18+ | Estado global: workspace activo, lista de documentos, historial de versiones, usuario autenticado. Recomendado si el equipo ya tiene experiencia con Redux. | Alta |
| ⚡ | **NgRx SignalStore** | v18+ | Alternativa moderna a NgRx clásico usando Signals. Menos boilerplate. **Recomendado si el equipo es nuevo en NgRx.** | Alternativa |

> **NgRx vs NgRx SignalStore — cuándo elegir cada uno:**
>
> - **NgRx clásico** si el equipo ya lo conoce o si se anticipa lógica de estado compleja con muchos efectos secundarios (sincronización, caché, optimistic updates).
> - **NgRx SignalStore** si el equipo es nuevo en NgRx o prefiere menos boilerplate. Integra bien con Signals nativos de Angular 19 y es la dirección a la que NgRx está evolucionando.
>
> Para el MVP de Versionly con equipo mediano, **SignalStore es la recomendación**.

---

### 2.5 UI y Estilos

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🎨 | **Tailwind CSS** | v3.x | Utilidades CSS para todo el diseño visual. Rápido de implementar, consistente, fácil de personalizar. | Core |
| 🧩 | **Angular CDK** | v19 | Primitivas de UI: overlays, portals, drag-drop (ordenar versiones), virtual scrolling (historial largo). | Alta |
| 🔠 | **Inter / JetBrains Mono** | Google Fonts | Inter para UI general, JetBrains Mono para bloques de código en el editor. Ambas libres. | Media |
| 🔔 | **ngx-toastr** | latest | Notificaciones toast in-app: nueva versión publicada, conflicto detectado. Liviano y configurable. | Alta |

---

### 2.6 HTTP, Autenticación y Tiempo Real

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🌐 | **Angular HttpClient** | v19 nativo | Comunicación REST con el backend. Interceptors para JWT y renovación de tokens. | Core |
| 🔑 | **angular-jwt** | latest | Decodificación y validación de JWT en el cliente. Manejo de expiración y refresh automático. | Alta |
| 📡 | **SSE (EventSource)** | Web API nativa | Server-Sent Events para recibir notificaciones in-app en tiempo real. Más simple que WebSockets para este caso de uso unidireccional. | Alta |

> **¿Por qué SSE en lugar de WebSockets para notificaciones?**
>
> Las notificaciones de Versionly son unidireccionales: el servidor notifica al cliente. SSE es más simple de implementar, no requiere librerías adicionales (EventSource es una Web API nativa), y es suficiente para el MVP. WebSockets queda reservado para la futura colaboración en tiempo real (v2.0).

---

### 2.7 Testing Frontend

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🧪 | **Jest** | v29+ | Testing unitario. Reemplaza Karma/Jasmine por ser más rápido y con mejor DX. Tests de componentes, servicios, diff engine. | Core |
| 🎭 | **Playwright** | v1.x | Testing E2E. Simula flujos completos: crear documento, guardar versión, comparar, compartir link. Soporte multi-browser. | Alta |
| 🔬 | **Angular Testing Library** | latest | Testing de componentes con foco en comportamiento del usuario, no en implementación interna. | Media |

---

## 3. Backend

### 3.1 Runtime y Framework

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🟢 | **Node.js** | v22 LTS | Runtime JavaScript del servidor. LTS garantiza soporte extendido. Mismo lenguaje que el frontend: TypeScript en ambas capas. | Core |
| 🏗️ | **NestJS** | v10+ | Framework backend con arquitectura modular (Módulos/Controllers/Services/Guards). TypeScript nativo, DI integrado, ideal para APIs REST estructuradas. | Core |
| ⚡ | **Fastify adapter** | NestJS built-in | Adapter de NestJS para usar Fastify como servidor HTTP en lugar de Express. Hasta 2x más rápido para rutas de alta frecuencia (autoguardado, diff). | Alta |

> **¿Por qué NestJS y no Express puro?**
>
> Express puro exige establecer arquitectura desde cero. En un equipo que ya usa Angular, NestJS es natural: mismos decoradores, mismo sistema de DI, misma filosofía modular. El código del backend se vuelve predecible y mantenible más rápido. NestJS no agrega overhead significativo y sus abstracciones son escapables cuando se necesita.

---

### 3.2 Base de Datos

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🐬 | **MySQL** | 8.0 | Base de datos principal. JSON para almacenar el contenido de versiones (AST de ProseMirror). ACID completo para integridad del historial. | Core |
| 🔷 | **Prisma ORM** | v5+ | ORM con TypeScript nativo. Schema declarativo, migraciones versionadas, client type-safe generado automáticamente. | Core |
| 🔴 | **Redis** | v7+ | Cache de sesiones de usuario, rate limiting, y cola de notificaciones pendientes. También útil para guardar borradores activos con TTL. | Alta |

> **Decisión de diseño clave: versiones como filas inmutables en MySQL**
>
> Cada versión guardada es una fila en la tabla `document_versions` con el campo `content` de tipo JSON. **Nunca se modifica — solo se insertan nuevas filas.** Esto garantiza el historial inalterable y simplifica las consultas de diff (solo se necesitan los IDs de dos versiones para comparar su contenido). El campo `is_current` (boolean) indica la Versión Actual. Solo un registro por documento puede tenerlo en `true`, controlado con una restricción a nivel de base de datos.

---

### 3.3 Autenticación y Seguridad

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🔐 | **Passport.js** | NestJS module | Estrategias de autenticación: Local (email/password) para MVP, extensible a OAuth (Google, GitHub) en v1.1. | Core |
| 🎟️ | **JWT (jsonwebtoken)** | NestJS module | Access tokens (15 min) + Refresh tokens (7 días). Rotación de refresh tokens en cada uso. | Core |
| 🔒 | **bcrypt** | latest | Hash seguro de contraseñas. Salt rounds: 12. No se almacenan contraseñas en texto plano. | Core |
| 🛡️ | **Helmet.js** | NestJS built-in | Headers HTTP de seguridad: CSP, HSTS, X-Frame-Options, etc. Una línea de configuración en NestJS. | Core |
| 🚦 | **throttler (NestJS)** | NestJS module | Rate limiting por IP y por usuario autenticado. Protege el endpoint de autoguardado de abuso. | Alta |

---

### 3.4 Google Drive Integration (v1.1)

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| ☁️ | **googleapis** | v120+ | Cliente oficial de Google APIs para Node.js. Maneja el acceso a Drive API v3: listar archivos, descargar contenido, obtener metadata. | v1.1 |
| 🔑 | **google-auth-library** | v9+ | Gestión del ciclo de vida de tokens OAuth2: intercambio de código por tokens, refresh automático, revocación. Usado directamente por `googleapis`. | v1.1 |
| 🛂 | **passport-google-oauth20** | v2.0 | Estrategia Passport para el flujo OAuth2 con Google. Maneja redirect, callback y extracción del perfil del usuario. | v1.1 |

**Decisiones de diseño:**

- **Cifrado de tokens:** Los `access_token` y `refresh_token` se cifran con AES-256 antes de persistirse en la tabla `drive_connections`. La clave de cifrado se gestiona como variable de entorno (`DRIVE_TOKEN_ENCRYPTION_KEY`). Los tokens nunca se almacenan en texto plano.
- **Sin SDK de Google en el frontend:** El flujo OAuth2 es completamente server-side (redirect). El frontend Angular nunca manipula tokens de Google directamente. El Drive File Picker se implementa mediante la API del backend (`GET /api/v1/integrations/google/files`), sin necesidad de cargar el Google Picker SDK en el cliente.
- **Importación intencional, sin auto-sync:** En v1.1, el usuario inicia explícitamente cada importación desde Drive. No hay sincronización automática ni polling en background. El polling/webhook queda reservado para v2.0.

---

### 3.5 Importación de Documentos

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 📄 | **mammoth.js** | v1.x | Convierte `.docx` a HTML o markdown preservando formato básico (títulos, listas, negrita, código). Paso intermedio antes de transformar a JSON de ProseMirror. | Core |
| 🔄 | **prosemirror-markdown** | latest | Convierte markdown a AST de ProseMirror. Complementa mammoth en la pipeline de importación. | Alta |
| 📁 | **Multer** | NestJS built-in | Manejo de upload de archivos (`.docx`). Validación de tipo y tamaño máximo antes de procesar. | Core |

**Pipeline de importación:**
```
.docx upload
  → mammoth.js convierte a HTML/Markdown
  → transformación a ProseMirror JSON
  → almacenamiento como v1.0 en MySQL
  → elementos no soportados → campo import_warnings → notificación al usuario
```

---

### 3.6 Storage de Archivos

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| ☁️ | **Cloudflare R2** | API S3-compatible | Almacenamiento de imágenes insertadas en documentos. Costo: $0 egress (a diferencia de AWS S3). Tier gratuito generoso para MVP. | Alta |
| 🔗 | **Pre-signed URLs** | SDK R2/S3 | Las imágenes se sirven con URLs pre-firmadas con TTL. No se expone el bucket directamente. | Alta |
| 🔄 | **AWS S3** *(alternativa)* | SDK oficial | Si el equipo ya tiene infraestructura AWS. Misma API que R2, solo cambia el endpoint y el modelo de costos. | Alternativa |

---

### 3.7 Notificaciones y Tiempo Real

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 📡 | **SSE (NestJS SSE)** | NestJS built-in | NestJS soporta SSE nativo con el decorator `@Sse()`. El cliente Angular se conecta con `EventSource`. Ideal para notificaciones in-app del MVP. | Core |
| 🔴 | **Redis Pub/Sub** | ioredis | Cuando múltiples instancias del servidor corren en paralelo, Redis Pub/Sub distribuye los eventos SSE al servidor correcto que tiene la conexión abierta con el cliente. | Media |
| 📧 | **Nodemailer + Resend** *(post-MVP)* | — | Email transaccional para notificaciones (v1.1). Resend ofrece 3,000 emails/mes gratis. | Post-MVP |

---

### 3.8 API y Documentación

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 📖 | **Swagger / OpenAPI** | NestJS module | Documentación automática de la API generada desde los decoradores de NestJS. Disponible en `/api/docs` en desarrollo. | Alta |
| ✅ | **class-validator** | NestJS built-in | Validación de DTOs con decoradores. Toda entrada de usuario es validada antes de llegar a la lógica de negocio. | Core |
| 🔄 | **class-transformer** | NestJS built-in | Serialización/deserialización de objetos. Excluye campos sensibles (passwords) de las respuestas automáticamente. | Core |

---

### 3.9 Testing Backend

| # | Tecnología | Versión | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🧪 | **Jest** | NestJS nativo | Testing unitario e integración de servicios, guards, controllers. NestJS viene configurado con Jest por defecto. | Core |
| 🔬 | **Supertest** | latest | Testing de endpoints HTTP reales. Levanta el servidor en memoria y lanza requests reales contra él. | Alta |
| 🐳 | **testcontainers** | latest | Levanta una instancia real de MySQL en Docker durante los tests de integración. Sin mocks de base de datos. | Media |

---

## 4. Infraestructura y DevOps

### 4.1 Entornos

| Entorno | Propósito | Tecnología sugerida |
|---|---|---|
| Development (local) | Desarrollo individual con hot reload | Docker Compose: Node + MySQL + Redis |
| Staging | QA, pruebas de integración, demo interna | Misma infra que producción, datos de prueba |
| Production | Usuarios reales | Ver sección 4.2 |

---

### 4.2 Hosting y Deploy

| # | Tecnología | Tipo | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 🚀 | **Railway / Render** | PaaS | Deploy del backend NestJS. Ambos tienen tier gratuito generoso para MVP y soporte nativo de MySQL y Redis. Railway es más simple. Render es más estable bajo carga. | MVP |
| ▲ | **Vercel / Netlify** | PaaS | Deploy del frontend Angular (build estático). CDN global, SSL automático, preview URLs para cada PR. | MVP |
| 🐳 | **Docker + Docker Compose** | DevOps | Contenedores para todos los servicios en local y staging. Garantiza paridad entre entornos. | Core |
| ☁️ | **AWS / GCP** *(post-MVP)* | Cloud | Alternativa de escala: EC2/ECS para backend, RDS para MySQL, ElastiCache para Redis. Mayor control, mayor complejidad. | Post-MVP |

---

### 4.3 Google Cloud Console (v1.1)

Para habilitar la integración con Google Drive se requiere:

| Requisito | Detalle |
|---|---|
| **Proyecto GCP** | Crear un proyecto en [console.cloud.google.com](https://console.cloud.google.com). Nombre sugerido: `versionly-prod` / `versionly-staging`. |
| **OAuth2 Credentials** | Crear credenciales de tipo "OAuth 2.0 Client ID" (tipo: Web application). Configurar `redirect_uris` con la URL del callback del backend. |
| **APIs habilitadas** | Google Drive API v3. Google People API (para `userinfo.profile` y `userinfo.email`). |
| **Quota Drive API** | 10,000 requests/día por proyecto (tier gratuito). Suficiente para MVP. Monitorear en GCP Console → APIs & Services → Quotas. |
| **Variables de entorno** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `DRIVE_TOKEN_ENCRYPTION_KEY` (32 bytes hex para AES-256). |
| **OAuth consent screen** | Configurar nombre de app, logo, dominio autorizado y scopes. Para producción, requiere verificación de Google si se supera el límite de 100 usuarios de prueba. |

> **Decisión de diseño — Sin sincronización en tiempo real en v1.1:** No se implementan webhooks de Drive (`drive.changes.watch`) ni polling en background. Toda importación desde Drive es iniciada manualmente por el usuario. El soporte de sync automático (polling o push notifications) queda reservado para v2.0.

---

### 4.4 CI/CD

| # | Tecnología | Costo | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| ⚙️ | **GitHub Actions** | Gratis | Pipeline CI/CD: lint → tests unitarios → tests E2E → build → deploy a staging (automático) → deploy a producción (manual o por tag). | Core |
| 🔍 | **ESLint + Prettier** | Gratis | Linting y formateo automático en ambas capas. Pre-commit hooks con Husky. | Core |
| 📦 | **Nx (monorepo)** | Gratis | Monorepo para frontend y backend. Permite compartir tipos TypeScript entre capas y coordinar builds. | Recomendado |

> **Recomendación: Monorepo con Nx**
>
> Para Versionly, un monorepo es especialmente valioso porque permite compartir los tipos TypeScript de los modelos de dominio (`Version`, `Document`, `Workspace`, `User`) entre frontend y backend sin duplicación. Nx tiene soporte de primera clase para Angular + NestJS en monorepo, con generators, caching de builds y dependency graph visual.
>
> Si el equipo prefiere simplicidad, dos repositorios separados también funciona. La decisión puede posponerse hasta el inicio del desarrollo.

---

### 4.5 Monitoreo y Observabilidad

| # | Tecnología | Costo | Rol en el proyecto | Prioridad |
|---|---|---|---|---|
| 📊 | **Sentry** | Tier gratuito | Error tracking en frontend y backend. Captura excepciones no manejadas con stack trace, contexto de usuario y release version. | Core |
| 📈 | **Grafana + Loki** | Open source | Logs estructurados del backend. Alternativa: Logtail / Better Stack (más simple, tier gratuito generoso). | Media |
| 🏥 | **Uptime Kuma** | Open source | Monitoreo de uptime con alertas. Self-hosted, gratuito, simple de configurar. | Alta |

---

## 5. Resumen Ejecutivo del Stack

Vista consolidada de todas las tecnologías por capa y prioridad para el MVP:

| Capa | Tecnología | Versión | Prioridad MVP |
|---|---|---|---|
| Frontend | Angular | 19 | ⚫ Core |
| Frontend | TypeScript | 5.5+ | ⚫ Core |
| Frontend | TipTap + ngx-tiptap | 2.x | ⚫ Core |
| Frontend | NgRx SignalStore | 18+ | 🟢 Alta |
| Frontend | Tailwind CSS | 3.x | ⚫ Core |
| Frontend | diff-match-patch | 1.x | ⚫ Core |
| Frontend | Jest + Playwright | 29+ / 1.x | ⚫ Core |
| Backend | Node.js | 22 LTS | ⚫ Core |
| Backend | NestJS + Fastify | 10+ | ⚫ Core |
| Backend | MySQL | 8.0 | ⚫ Core |
| Backend | Prisma ORM | 5+ | ⚫ Core |
| Backend | Redis | 7+ | 🟢 Alta |
| Backend | Passport.js + JWT | NestJS | ⚫ Core |
| Backend | mammoth.js | 1.x | 🟢 Alta |
| Backend | googleapis | 120+ | 🔵 v1.1 |
| Backend | google-auth-library | 9+ | 🔵 v1.1 |
| Backend | passport-google-oauth20 | 2.0 | 🔵 v1.1 |
| Backend | Jest + Supertest | NestJS nativo | ⚫ Core |
| Storage | Cloudflare R2 | S3-compat. | 🟢 Alta |
| DevOps | Docker + Compose | latest | ⚫ Core |
| DevOps | GitHub Actions | Gratis | ⚫ Core |
| DevOps | Nx (monorepo) | latest | 🔵 Recomendado |
| Hosting | Railway / Render | PaaS | 🟢 MVP |
| Hosting | Vercel / Netlify | PaaS | 🟢 MVP |
| Monitoreo | Sentry | Tier gratuito | ⚫ Core |

---

## 6. Consideraciones Finales

### 6.1 Lo que esta propuesta NO incluye (decisiones deliberadas)

- **GraphQL** — REST es suficiente y más simple para el modelo de datos de Versionly. GraphQL agregaría complejidad sin beneficio claro en MVP.
- **Microservicios** — arquitectura monolítica modular (NestJS) es correcta para MVP. La separación puede hacerse si el volumen lo justifica.
- **Kubernetes** — sobredimensionado para MVP. Docker Compose en PaaS es suficiente hasta alcanzar escala real.
- **WebSockets en MVP** — SSE cubre el caso de notificaciones unidireccionales con menos complejidad. WebSockets queda para colaboración en tiempo real (v2.0).
- **MongoDB** — MySQL con JSON ofrece las ventajas de documentos flexibles con las garantías ACID que un historial inmutable requiere.

### 6.2 Estimación de Esfuerzo de Configuración Inicial

| Tarea de setup | Estimación | Frecuencia |
|---|---|---|
| Configurar monorepo Nx con Angular + NestJS | 1-2 días | Una vez |
| Docker Compose local (Node + MySQL + Redis) | 0.5 días | Una vez |
| Schema Prisma inicial + migraciones base | 1 día | Continuo |
| Autenticación JWT completa (register/login/refresh) | 2-3 días | Una vez |
| Integración TipTap en Angular con autoguardado | 3-4 días | Una vez |
| Pipeline diff-match-patch + renderizador visual | 4-5 días | Una vez |
| GitHub Actions CI/CD a Railway + Vercel | 1 día | Una vez |
| Sentry en frontend y backend | 0.5 días | Una vez |
| **Setup total estimado antes de features de producto** | **~13-17 días** | — |

---

> **Stack diseñado para crecer con el producto.**  
> Cada tecnología elegida tiene una ruta de salida o escalado clara. No hay callejones sin salida.

---

*Documento confidencial — Solo uso interno. Sujeto a revisión por el equipo técnico.*
