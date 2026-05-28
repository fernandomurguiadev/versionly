# Versionly — Análisis Funcional MVP
**Versión 1.0 · Febrero 2025 · Documento en revisión**

---

> **Audiencia:** Equipo de producto y desarrollo  
> **Estado:** En revisión  
> **Autor:** Análisis elaborado con asistencia de IA

---

## Tabla de Contenidos

1. [Opinión Ejecutiva](#1-opinión-ejecutiva)
2. [Problema y Propuesta de Valor](#2-problema-y-propuesta-de-valor)
3. [Alcance del MVP](#3-alcance-del-mvp)
4. [Arquitectura Funcional](#4-arquitectura-funcional)
5. [Flujos Funcionales Principales](#5-flujos-funcionales-principales)
6. [Editor Interno](#6-editor-interno)
7. [Comparación y Diff de Versiones](#7-comparación-y-diff-de-versiones)
8. [Sistema de Notificaciones](#8-sistema-de-notificaciones-mvp)
9. [Autenticación y Onboarding](#9-autenticación-y-onboarding)
10. [Consideraciones Técnicas](#10-consideraciones-técnicas-para-el-equipo-de-desarrollo)
11. [Roadmap Post-MVP](#11-roadmap-post-mvp-referencia)
12. [Glosario](#12-glosario)

---

## 1. Opinión Ejecutiva

Versionly resuelve un problema genuino y cotidiano en equipos de desarrollo de software: el caos de versiones de documentación. La propuesta de valor es clara, el alcance del MVP está bien acotado y las decisiones de diseño tomadas hasta ahora son coherentes entre sí.

El mayor activo del producto es su **foco**. En lugar de competir con Google Docs o Notion en riqueza de features, Versionly apuesta a hacer tres cosas excepcionalmente bien: versionar con intención, comparar con precisión y compartir con confianza. Esa claridad de propósito es difícil de mantener y vale la pena protegerla durante el desarrollo.

Las **decisiones más acertadas del MVP** son la eliminación de la colaboración en tiempo real (reduce complejidad técnica drásticamente sin sacrificar el valor core), el modelo de "Versión Actual" como punto focal por encima del historial, y los links inteligentes con comportamiento diferenciado fijo/dinámico.

El **riesgo técnico más alto** del proyecto es el editor interno con diff preciso. Ambos features son resolubles con librerías maduras (TipTap/ProseMirror para el editor, diff-match-patch para comparación), pero requieren integración cuidadosa para garantizar que el formato se preserve correctamente al importar documentos externos.

---

> ✅ **Veredicto sobre el nombre: Versionly**
>
> Nombre correcto. Es descriptivo sin ser genérico, fácil de pronunciar en español e inglés, no colisiona con productos conocidos del mismo segmento, y comunica la propuesta de valor (versionado) de forma inmediata.
> **Recomendación:** verificar disponibilidad del dominio `.io` o `.app`.

---

## 2. Problema y Propuesta de Valor

### 2.1 Problema Central

Los equipos de desarrollo de software generan grandes volúmenes de documentación técnica: especificaciones de API, documentos de diseño, acuerdos de interfaz, manuales de integración. El proceso de evolución de estos documentos presenta tres síntomas recurrentes:

- **Ambigüedad de versión actual:** múltiples archivos con nombres similares (`spec_final`, `spec_final_v2`, `spec_USAR_ESTE`) sin indicador objetivo de cuál es la versión vigente.
- **Falta de trazabilidad:** no existe registro claro de quién modificó qué, cuándo y con qué propósito, lo que dificulta auditorías y resolución de conflictos.
- **Distribución insegura:** se comparten links o archivos sin garantía de que el receptor esté viendo la versión correcta.

### 2.2 Propuesta de Valor

Un espacio centralizado donde el editor de un documento trabaja en borradores privados, publica versiones nombradas con propósito explícito, y los colaboradores siempre acceden a la versión canónica correcta con historial disponible cuando lo necesitan.

---

## 3. Alcance del MVP

### 3.1 Dentro del Alcance

| Módulo | Feature | Prioridad | Complejidad |
|---|---|---|---|
| Autenticación | Registro e inicio de sesión por email y contraseña | Alta | Baja |
| Autenticación | Sistema de roles: Administrador / Editor / Viewer | Alta | Media |
| Workspace | Creación y gestión de workspaces por usuario | Alta | Baja |
| Workspace | Invitar usuarios a workspace con rol asignado | Alta | Media |
| Organización | Jerarquía Proyecto → Carpeta → Archivo | Alta | Baja |
| Organización | Filtro/búsqueda por nombre, fecha creación, última modificación | Alta | Media |
| Editor | Editor de texto enriquecido interno (títulos, listas, código, links) | Alta | Alta |
| Editor | Autoguardado continuo de borrador (silencioso) | Alta | Media |
| Versiones | Guardar versión nombrada con comentario obligatorio | Alta | Baja |
| Versiones | Marcar versión como "Versión Actual" (canónica) | Alta | Baja |
| Versiones | Historial completo de versiones por documento | Alta | Baja |
| Versiones | Detección y aviso de guardado simultáneo (conflicto) | Alta | Media |
| Comparación | Diff visual entre dos versiones seleccionadas | Alta | Alta |
| Comparación | Panel resumen de cambios con navegación por sección | Media | Media |
| Comparación | Merge manual asistido al resolver conflictos | Media | Alta |
| Compartir | Link fijo a versión específica | Alta | Media |
| Compartir | Link dinámico a Versión Actual (siempre actualizado) | Alta | Media |
| Compartir | Vista de solo lectura para receptores del link | Alta | Baja |
| Notificaciones | Notificación in-app al publicar nueva Versión Actual | Alta | Media |
| Importación | Importar desde `.docx` y Google Docs (última versión del contenido) | Media | Alta |
| Importación | Preservar formato de origen al importar | Media | Alta |
| Admin | El Administrador puede eliminar versiones finales con warning explícito | Alta | Media |
| Admin | El Editor puede eliminar versiones borrador propias | Alta | Baja |

### 3.2 Fuera del Alcance (MVP)

- Colaboración en tiempo real (edición simultánea tipo Google Docs)
- Exportación a formatos externos (`.pdf`, `.docx`) desde Versionly
- Notificaciones por email
- Comentarios en márgenes o anotaciones inline
- Plantillas de documento
- Importación del historial de versiones desde origen externo
- Límites de plan freemium (definidos post-MVP)
- Integraciones con herramientas de terceros (Slack, Jira, etc.)
- **Sincronización con Google Drive via OAuth2** — planificado para v1.1 (ver sección 5.5 y sección 11)

---

## 4. Arquitectura Funcional

### 4.1 Estructura de Datos

La jerarquía de organización sigue una estructura de cuatro niveles:

```
Workspace
└── Proyecto
    └── Carpeta
        └── Archivo (Documento)
            └── Versiones
```

**Reglas de negocio:**

- Un archivo **siempre** pertenece a una carpeta. No existen archivos sueltos.
- Una carpeta siempre pertenece a un proyecto.
- Un proyecto siempre pertenece a un workspace.
- Un usuario puede tener múltiples workspaces.
- Un workspace puede tener múltiples proyectos.
- No hay límite de versiones por documento en el MVP.
- Cada versión tiene: nombre, comentario, autor, timestamp e identificador único.

### 4.2 Modelo de Versiones

Cada documento tiene tres planos de existencia diferenciados:

| Plano | Descripción | Visibilidad | Quién puede modificar |
|---|---|---|---|
| **Borrador activo** | Estado continuo del editor. Se autoguarda silenciosamente. No es una versión. | Solo el Editor | Editor asignado |
| **Versión guardada** | Instantánea nombrada e intencional del documento. Inmutable una vez guardada. | Editor + Viewers invitados | Nadie (solo lectura) |
| **Versión Actual** | Una versión guardada marcada como la canónica vigente. Solo puede haber una por documento. | Todos con acceso | Editor (reasignar) / Admin (eliminar) |

### 4.3 Modelo de Acceso y Roles

El sistema opera en dos niveles: **workspace** y **documento**. El rol a nivel documento prevalece cuando amplía el acceso.

| Permiso / Acción | Admin (workspace) | Editor (workspace) | Viewer (workspace) | Editor (documento) | Viewer (documento) |
|---|:---:|:---:|:---:|:---:|:---:|
| Crear proyectos | ✅ | — | — | — | — |
| Crear carpetas | ✅ | ✅ | — | — | — |
| Invitar usuarios al workspace | ✅ | — | — | — | — |
| Crear documentos | ✅ | ✅ | — | ✅ | — |
| Editar contenido | ✅ | ✅ | — | ✅ | — |
| Guardar versiones nombradas | ✅ | ✅ | — | ✅ | — |
| Marcar Versión Actual | ✅ | ✅ | — | ✅ | — |
| Eliminar versión borrador propia | ✅ | ✅ | — | ✅ | — |
| Eliminar Versión Actual *(con warning)* | ✅ | — | — | — | — |
| Eliminar documento completo *(con warning)* | ✅ | — | — | — | — |
| Ver documento y versiones | ✅ | ✅ | ✅ | ✅ | ✅ |
| Compartir links | ✅ | ✅ | — | ✅ | — |
| Acceso por link compartido | — | — | — | — | ✅ |

> **Nota sobre asignación de acceso:** un usuario puede ser invitado al workspace o a un documento específico. El rol de documento se utiliza para ampliar acceso puntual.

---

## 5. Flujos Funcionales Principales

### 5.1 Flujo de Creación y Publicación de Versión

1. El Editor abre o crea un documento dentro de una Carpeta → Proyecto → Workspace.
2. El sistema inicia **autoguardado del borrador** cada 30 segundos o tras N cambios. El usuario no necesita hacer nada.
3. Cuando el Editor desea crear un hito, hace click en **"Guardar Versión"**. El sistema solicita: nombre de versión *(requerido)* y comentario *(opcional pero recomendado)*.
4. La versión se guarda como **inmutable**. El borrador continúa activo para futuras ediciones.
5. El Editor puede marcar la nueva versión como **"Versión Actual"**. El sistema notifica in-app a todos los Viewers y Editores del documento.

### 5.2 Flujo de Conflicto por Guardado Simultáneo

> **Escenario:** dos editores guardan versión al mismo tiempo.

1. El sistema detecta que dos versiones fueron generadas en un margen de tiempo cercano sobre el mismo estado base.
2. Ambas versiones se guardan normalmente (ej: `v1.3` y `v1.3b`).
3. El sistema notifica a ambos usuarios: *"Tu versión fue guardada simultáneamente con v1.3b de [Nombre]. Se recomienda comparar y hacer merge antes de marcar como Versión Actual."*
4. Los editores usan el comparador para revisar diferencias.
5. Uno de los editores crea una nueva versión de merge (`v1.4`) integrando manualmente los cambios deseados.
6. El conflicto se resuelve cuando uno marca la versión resultante como Versión Actual.

### 5.3 Flujo de Compartir Documento

1. El Editor hace click en **"Compartir"** desde cualquier pantalla del documento.
2. El sistema ofrece dos opciones:
   - **Link dinámico** — siempre apunta a la Versión Actual, se actualiza automáticamente.
   - **Link fijo** — apunta a una versión específica del historial, no cambia nunca.
3. El receptor accede sin cuenta y ve el documento en **modo solo lectura**. Puede navegar el historial si el Editor así lo configuró.
4. **Caso borde:** si se accede a un link fijo cuya versión fue eliminada, el sistema muestra: *"Esta versión del documento ya no está disponible. Contacte al propietario del documento."*

### 5.4 Flujo de Importación de Documento Externo

1. El Editor selecciona **"Importar documento"** dentro de una carpeta.
2. Formatos soportados en MVP: `.docx` (Word) y exportación `.docx` desde Google Docs.
3. El sistema convierte el contenido al formato interno de Versionly, preservando: títulos y subtítulos, negritas/cursivas/subrayado, listas ordenadas y no ordenadas, bloques de código, enlaces.
4. Se crea automáticamente la primera versión: **"v1.0 — Importado desde [nombre de archivo]"**. El historial de versiones del origen no se importa.
5. Si hay elementos de formato no soportados, el sistema notifica: *"X elementos no pudieron importarse y fueron omitidos."*

### 5.5 Flujo de Importación desde Google Drive *(v1.1)*

> Este flujo no está incluido en el MVP. Se documenta aquí como referencia para planificación de v1.1.

**Premisa de diseño:** la sincronización con Google Drive es **intencional**, no automática. Versionly no monitorea cambios en Drive de forma silenciosa. El usuario decide explícitamente cuándo importar una versión desde Drive.

**Prerrequísito:** el usuario debe haber conectado su cuenta de Google (ver CU-17 en el documento de casos de uso v1.1).

**Flujo principal:**

1. El Editor abre un documento en Versionly y selecciona **"Importar desde Google Drive"**.
2. Se abre el selector de archivos de Google Drive (Google Picker API). El usuario puede navegar su Drive y seleccionar un archivo `.docx` o un Google Doc.
3. Versionly obtiene el contenido del archivo:
   - Para Google Docs: exporta a `.docx` via Drive API y lo convierte con mammoth.js → ProseMirror JSON.
   - Para `.docx` nativos: descarga y convierte con mammoth.js → ProseMirror JSON.
4. El sistema muestra una previsualización del contenido importado con los warnings de formato (elementos no soportados omitidos).
5. El Editor confirma la importación. Se crea una nueva versión nombrada: **"Importado desde Drive — [nombre del archivo] — [fecha]"**. El Editor puede renombrarla antes de confirmar.
6. La nueva versión queda en el historial como cualquier otra versión. El Editor puede marcarla como Versión Actual si lo desea.
7. Se registra la relación entre el documento de Versionly y el archivo de Drive (entidad `DriveFileMapping`) para facilitar futuras importaciones del mismo archivo.

**Casos borde:**
- Si el archivo en Drive fue eliminado o el acceso fue revocado, el sistema muestra un error descriptivo y sugiere reconectar la cuenta.
- Si el token OAuth expiró, el sistema solicita reautenticación antes de continuar.
- El historial de versiones del archivo en Drive **no** se importa. Solo se importa el estado actual del archivo en el momento de la importación.

---

## 6. Editor Interno

### 6.1 Capacidades del Editor MVP

| Categoría | Feature | Notas |
|---|---|---|
| Estructura | Títulos H1, H2, H3 | Esenciales para navegación en docs técnicos |
| Estructura | Párrafos y texto libre | Base del documento |
| Formato inline | Negrita, cursiva, subrayado, tachado | Formato básico universal |
| Listas | Lista con viñetas (multinivel) | Para enumeraciones y requisitos |
| Listas | Lista numerada | Para procedimientos y pasos |
| Técnico | Bloque de código con resaltado de sintaxis | Crítico para specs de software |
| Técnico | Código inline | Para referencias a variables, endpoints |
| Navegación | Links internos y externos | URLs y referencias entre secciones |
| Multimedia | Inserción de imágenes (upload) | Diagramas, capturas de pantalla |
| Historia | Deshacer/rehacer ilimitado dentro de sesión | Estándar esperado |
| Guardado | Autoguardado de borrador cada 30 segundos | Silencioso, no interrumpe el flujo |

### 6.2 No Incluido en Editor MVP

- Tablas (la complejidad de diff en tablas es desproporcionada para MVP)
- Comentarios en márgenes o anotaciones inline
- Imágenes flotantes con wrap de texto
- Plantillas pre-diseñadas
- Formato de página (orientación, márgenes, encabezados/pies)
- Macros o fórmulas

### 6.3 Recomendación Técnica para el Editor

Se recomienda **TipTap** (sobre ProseMirror) como base del editor. Justificación: es open source con licencia MIT, tiene extensiones mantenidas para todos los features del MVP, genera un formato JSON estructurado que facilita el diff preciso, y tiene comunidad activa con documentación sólida. La alternativa es Quill.js, más simple pero con menos soporte para features técnicos como bloques de código con sintaxis.

---

## 7. Comparación y Diff de Versiones

### 7.1 Interfaz de Comparación

La pantalla de comparación es uno de los diferenciadores centrales de Versionly. Debe permitir entender en menos de 10 segundos qué cambió entre dos versiones de un documento técnico extenso.

**Componentes de la pantalla:**

**① Selector de versiones** — dos dropdowns en la parte superior. Por defecto se pre-seleccionan las dos versiones más recientes.

**② Panel de resumen** — barra colapsable que muestra:
- `N secciones modificadas` · `N secciones eliminadas` · `N secciones nuevas`
- Cada ítem es clickeable y navega al primer cambio de ese tipo.

**③ Vista diff lado a lado** — Versión A a la izquierda, Versión B a la derecha:
- 🟢 **Verde:** texto añadido en B
- 🔴 **Rojo:** texto eliminado respecto de A
- 🔵 **Azul/subrayado:** texto modificado
- Sin color: texto sin cambios

**④ Barra de navegación** — flechas para ir al cambio anterior / siguiente. Esencial en documentos largos.

### 7.2 Editor de Merge

Cuando el sistema detecta un conflicto de guardado simultáneo, ofrece un editor de merge simplificado. No es automático — requiere decisión humana para cada bloque en conflicto. El Editor elige qué bloque conservar (versión A, versión B, o edita manualmente una combinación). El resultado se guarda como una nueva versión nombrada.

> **Para MVP:** el merge puede implementarse como selección de bloques completos, no edición a nivel de línea. La edición granular puede agregarse en versiones posteriores.

---

## 8. Sistema de Notificaciones (MVP)

Para el MVP, todas las notificaciones son **in-app**. No hay envío de emails.

| Evento | Quién recibe | Mensaje |
|---|---|---|
| Se publica nueva Versión Actual | Todos los usuarios con acceso al documento | *"[Nombre] publicó la Versión Actual de [Documento]: v2.0 — Aprobado por cliente"* |
| Conflicto de guardado simultáneo | Los dos editores involucrados | *"Tu versión fue guardada al mismo tiempo que otra. Se recomienda comparar antes de marcar como Versión Actual."* |
| Se agrega usuario a workspace o documento | Usuario invitado | *"[Admin] te agregó al workspace [Nombre] con rol [Editor/Viewer]"* |
| Link compartido accedido con versión eliminada | Receptor del link (página de estado) | *"Esta versión del documento ya no está disponible. Contacte al propietario."* |

---

## 9. Autenticación y Onboarding

### 9.1 Registro e Inicio de Sesión

- Registro mediante **email y contraseña**. Sin OAuth en MVP (puede agregarse en v1.1).
- Verificación de email antes de activar la cuenta.
- Recuperación de contraseña por email.
- Sesión persistente con JWT. Tiempo de expiración configurable.

### 9.2 Flujo de Onboarding Post-Registro

Al crear su primera cuenta, el usuario pasa por un onboarding de 3 pasos:

1. **Crear workspace** — el usuario nombra su primer workspace (ej: *"Mi equipo"*, *"Proyecto Alpha"*).
2. **Crear proyecto** — dentro del workspace, se crea un proyecto inicial.
3. **Primera acción** — el sistema invita al usuario a crear su primer documento o importar uno existente. *Esta pantalla es salteable.*

> El onboarding completo no debería tomar más de **90 segundos**. El objetivo es que el usuario tenga su primer documento funcionando antes de los 5 minutos de haber creado su cuenta.

---

## 10. Consideraciones Técnicas para el Equipo de Desarrollo

### 10.1 Stack Recomendado

| Capa | Opción recomendada | Justificación |
|---|---|---|
| Editor | TipTap (sobre ProseMirror) | JSON estructurado facilita diff preciso. Extensiones para todos los features del MVP. |
| Diff engine | diff-match-patch (Google) | Biblioteca madura, bien probada, maneja texto Unicode correctamente. |
| Backend | Node.js + MySQL 8.0 | JSON en MySQL para almacenar versiones del editor de forma eficiente. |
| Autenticación | JWT con refresh tokens | Simple de implementar, escalable para freemium futuro. |
| Storage de imágenes | S3-compatible (ej: Cloudflare R2) | Costo controlado, fácil de integrar. |
| Links compartidos | UUIDs únicos con metadata en BD | Simple, seguro, sin dependencias externas. |

### 10.2 Riesgos Técnicos Identificados

> 🔴 **Riesgo Alto — Importación con fidelidad de formato**
>
> Preservar el formato exacto al importar desde `.docx` o Google Docs es técnicamente complejo. Los formatos tienen elementos que no tienen equivalente en el editor de Versionly.
> **Mitigación:** definir explícitamente qué elementos se importan y notificar al usuario sobre los omitidos. No prometer fidelidad 100% en el MVP.

> 🟠 **Riesgo Medio — Diff en documentos con imágenes o código**
>
> El diff de texto funciona bien. Las imágenes y bloques de código requieren manejo especial.
> **Mitigación:** en MVP, las imágenes se marcan como *"imagen modificada"* sin mostrar diff visual. El diff de código se hace a nivel de texto dentro del bloque.

> 🔵 **Riesgo Bajo — Autoguardado y pérdida de datos**
>
> El autoguardado puede generar carga si muchos usuarios editan documentos extensos simultáneamente.
> **Mitigación:** autoguardar solo si hubo cambios desde el último guardado. Considerar guardar en `localStorage` como respaldo inmediato.

> 🟠 **Riesgo Medio — Expiración de tokens OAuth de Google Drive** *(v1.1)*
>
> Los access tokens de Google OAuth2 expiran a la hora. Si el usuario no usa la integración frecuentemente, el refresh token puede revocarse por inactividad o por cambio de contraseña en su cuenta de Google.
> **Mitigación:** implementar renovación automática con el refresh token antes de cada operación de Drive. Detectar errores 401/403 de la API y solicitar reautenticación con mensaje claro. Almacenar refresh tokens cifrados en base de datos.

> 🟠 **Riesgo Medio — Cuotas de la Drive API de Google** *(v1.1)*
>
> La Drive API tiene límites de solicitudes por usuario y por proyecto (queries per 100 seconds). En planes gratuitos de Google Cloud, el límite es restrictivo para un servicio con muchos usuarios.
> **Mitigación:** implementar reintentos con backoff exponencial. En v1.1 el modelo es pull (el usuario activa la importación), lo que reduce drásticamente el volumen de llamadas vs. un modelo de polling automático. Monitorear el uso desde Google Cloud Console desde el primer deploy.

---

## 11. Roadmap Post-MVP (Referencia)

| Feature | Versión sugerida | Valor para el usuario |
|---|---|---|
| Notificaciones por email | v1.1 | Mejora drástica de la tasa de apertura y uso activo |
| OAuth (Google, GitHub) para login | v1.1 | Reduce fricción de registro para equipos de software |
| Exportación a PDF / .docx | v1.1 | Permite compartir fuera de la plataforma |
| **Google Drive OAuth2 — Importación intencional desde Drive** | **v1.1** | **El usuario conecta su cuenta de Google (scopes `drive.readonly` + `drive.metadata.readonly`) y puede importar archivos `.docx` o Google Docs desde un selector de Drive. Cada importación crea una nueva versión en Versionly. Sin auto-sync — el usuario decide cuándo importar. Requiere nuevas entidades `DriveConnection` y `DriveFileMapping`. Conversión con mammoth.js (ya en stack).** |
| Comentarios inline en versiones | v1.2 | Feedback estructurado sin herramientas externas |
| Límites freemium (workspaces, docs) | v1.2 | Habilita monetización |
| Google Drive Watch API — detección de cambios automática | v2.0 | Notifica al usuario cuando el archivo en Drive cambió, para que decida si importar |
| Colaboración en tiempo real | v2.0 | Amplía el caso de uso a edición colaborativa |
| Integración con Slack (notificaciones) | v2.0 | Lleva las notificaciones donde ya trabaja el equipo |
| Historial de auditoría (quién accedió cuándo) | v2.0 | Valor alto para contextos regulatorios o de cliente |
| API pública para integraciones | v2.1 | Habilita ecosistema de partners |

---

## 12. Glosario

| Término | Definición en el contexto de Versionly |
|---|---|
| **Borrador activo** | Estado continuo del documento en edición. Se autoguarda silenciosamente. No es una versión y no es visible para Viewers. |
| **Versión guardada** | Instantánea inmutable y nombrada del documento creada intencionalmente por el Editor. Tiene nombre, comentario, autor y timestamp. |
| **Versión Actual** | La versión guardada designada como la canónica vigente. Solo puede haber una por documento. Es la que se muestra por defecto a todos los usuarios y a los receptores de links dinámicos. |
| **Link dinámico** | URL de compartir que siempre apunta a la Versión Actual. Si el Editor publica una nueva versión, el link la muestra automáticamente. |
| **Link fijo** | URL de compartir que apunta permanentemente a una versión específica del historial. No cambia aunque se publiquen nuevas versiones. Útil para auditorías y contratos. |
| **Conflicto de guardado** | Situación en que dos editores guardan una versión desde el mismo estado base del documento en un margen de tiempo cercano. |
| **Merge** | Proceso de integrar manualmente los cambios de dos versiones en conflicto en una nueva versión unificada. |
| **Workspace** | Contenedor de nivel superior creado y administrado por un usuario. Puede representar una organización, un equipo o un proyecto macro. |
| **Editor (rol)** | Usuario con permiso de creación, edición y publicación de versiones en un documento o workspace. |
| **Viewer (rol)** | Usuario con permiso de solo lectura. Accede a la Versión Actual y al historial si así se le permite. |
| **Admin (rol)** | Usuario con permisos completos sobre el workspace, incluyendo acciones destructivas sobre versiones y documentos. |

---

*Documento sujeto a revisión. Próximo paso: definición de casos de uso detallados por módulo.*
