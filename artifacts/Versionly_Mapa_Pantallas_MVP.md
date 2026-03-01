# Versionly — Mapa de Pantallas Revisado (MVP)
**Versión 1.1 · Febrero 2026 · Análisis + Mejoras**

---

## Resumen del análisis

El mapa original de 8 secciones y ~25 pantallas cubre correctamente el flujo principal pero tiene **brechas funcionales importantes**: pantallas faltantes que bloquearían flujos definidos en el análisis funcional, pantallas mezcladas que deberían separarse, y ausencia total de estados de error, estados vacíos y pantallas de administración.

| | Original | Revisado |
|---|:---:|:---:|
| Secciones | 8 | 11 |
| Pantallas / vistas | ~25 | ~52 |
| Estados de error modelados | 0 | 8 |
| Estados vacíos (empty states) | 0 | 6 |
| Pantallas de Admin | 0 | 5 |
| Flujos de conflicto cubiertos | 0 | 1 |
| Pantallas de settings | 0 | 4 |

---

## Lo que estaba bien en el mapa original

- La cobertura del flujo principal (registro → editor → versión → compartir) es correcta y coherente.
- La separación de "diff visual" y "selector de versiones" como vistas distintas es una buena decisión de UX.
- Incluir "Vista pública por link" es correcto — es una experiencia radicalmente distinta al resto de la app.
- La sección de importación aparece como flujo propio, no enterrada en el editor, lo cual es adecuado.

---

## Brechas identificadas y correcciones aplicadas

### Brecha 1 — Gestión de workspace sin pantallas
El AF define que el Admin crea proyectos, invita usuarios y gestiona roles. El mapa original no tiene ninguna pantalla de settings de workspace ni de gestión de miembros.

**Pantallas añadidas:** Settings de workspace, gestión de miembros, invitación de usuario, transferencia de Admin.

### Brecha 2 — Merge de conflicto sin pantalla
El flujo 5.2 del AF define un editor de merge cuando dos editores guardan simultáneamente. No existe en el mapa original.

**Pantalla añadida:** Editor de merge (resolución de conflicto).

### Brecha 3 — "Crear documento" es un modal, no una pantalla
En el mapa original aparece como pantalla independiente. Crear un documento es una acción simple (nombre + carpeta destino) que se resuelve con un modal/drawer sobre la lista. Separarla genera una navegación innecesaria.

**Corrección:** se marca como modal, no pantalla completa.

### Brecha 4 — Permisos por documento mezclado con lista
"Permisos por documento" en el mapa original aparece en la sección de documentos, pero funcionalmente es parte del documento mismo (accesible desde dentro del editor o desde el menú del documento).

**Corrección:** movido a la sección de Editor/Documento como panel lateral o modal.

### Brecha 5 — Estados vacíos y de error ausentes
Sin empty states definidos, el frontend queda sin spec para los estados más frecuentes del primer uso (workspace sin proyectos, carpeta sin documentos, historial vacío). Sin estados de error, flujos como link revocado o versión eliminada quedan sin pantalla.

**Pantallas añadidas:** 6 empty states, 4 páginas de error/estado.

### Brecha 6 — Sin pantalla de perfil de usuario
El AF define email, contraseña y verificación de email. No hay pantalla para que el usuario gestione su cuenta.

**Pantalla añadida:** Configuración de perfil / cuenta.

### Brecha 7 — Notificación de conflicto sin destino claro
El feed de notificaciones muestra el conflicto, pero hacer click en esa notificación debe llevar a algún lugar concreto. Sin modelar el destino, el frontend no sabe qué renderizar.

**Corrección:** las notificaciones de conflicto llevan a la vista de Merge directamente.

### Brecha 8 — Onboarding incompleto: falta la pantalla de "carpeta"
El AF define onboarding en 3 pasos: workspace → proyecto → carpeta. El mapa original solo menciona "crear workspace → proyecto → carpeta" como un ítem único, sin especificar si son pasos separados o uno solo.

**Corrección:** modelado explícitamente como wizard de 3 pasos con pantallas/estados propios.

---

## Mapa de Pantallas Revisado v1.1

---

### 1. Autenticación

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| AUTH-01 | Registro | Página completa | Email + contraseña. Link a login. |
| AUTH-02 | Login | Página completa | Email + contraseña. Link a registro y recuperación. |
| AUTH-03 | Verificación de email | Página completa | Pantalla de espera con instrucción de revisar el correo. Botón "reenviar". |
| AUTH-04 | Email verificado | Página completa | Confirmación de verificación exitosa. Redirige al onboarding. |
| AUTH-05 | Recuperación de contraseña — solicitud | Página completa | Campo de email para solicitar el link. |
| AUTH-06 | Recuperación de contraseña — nueva contraseña | Página completa | Formulario con nueva contraseña y confirmación. Accesible vía token en URL. |
| AUTH-07 | Token inválido / expirado | Página de error | Para links de verificación o reset expirados. Botón "solicitar nuevo link". |

> **Nota:** AUTH-07 es nueva. Sin ella, el usuario que accede a un link expirado ve un error genérico del servidor.

---

### 2. Onboarding

El onboarding es un wizard lineal de 3 pasos. Cada paso es una vista dentro de un layout de onboarding (no el layout principal de la app). El usuario no puede saltarse los pasos excepto el paso 3.

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| ON-01 | Paso 1: Crear workspace | Wizard step | Nombre del workspace. No tiene paso atrás. |
| ON-02 | Paso 2: Crear proyecto | Wizard step | Nombre del proyecto dentro del workspace recién creado. |
| ON-03 | Paso 3: Crear carpeta | Wizard step | Nombre de la carpeta dentro del proyecto. Salteable. |
| ON-04 | Paso 4: Primera acción | Wizard step | Dos opciones: "Crear documento" o "Importar documento". Salteable. |

> **Nota:** ON-03 y ON-04 son nuevos. El mapa original colapsaba los 4 pasos en una sola línea. Separarlos permite medir abandono por step y mostrar un indicador de progreso claro.

---

### 3. Workspace y navegación principal

Layout permanente de la app (sidebar + área de contenido). Todas las pantallas de esta sección comparten el mismo layout.

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| WS-01 | Selector de workspace | Modal / dropdown | Lista de workspaces del usuario + botón "Crear workspace". Accesible desde el header. |
| WS-02 | Home de workspace | Página | Resumen: proyectos recientes, documentos modificados recientemente, actividad del workspace. |
| WS-03 | Lista de proyectos | Página | Todos los proyectos del workspace. Búsqueda por nombre. Botón "Nuevo proyecto" (Admin). |
| WS-04 | Vista de proyecto (carpetas) | Página | Carpetas del proyecto. Búsqueda. Botón "Nueva carpeta" (Admin/Editor). |
| WS-05 | Empty state: workspace sin proyectos | Estado | Se muestra cuando el workspace no tiene proyectos. CTA: "Crear primer proyecto". |
| WS-06 | Empty state: proyecto sin carpetas | Estado | CTA: "Crear primera carpeta". |

> **Nota WS-02:** el Home de workspace es nuevo como pantalla explícita. Ofrece acceso rápido a documentos recientes sin tener que navegar toda la jerarquía. Muy útil cuando el workspace crece.

> **Nota WS-05/06:** los empty states son nuevos. Sin ellos, el primer uso muestra una lista vacía sin ninguna orientación.

---

### 4. Settings de workspace y miembros

Sección completamente nueva. El mapa original no tenía ninguna pantalla de administración.

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| SET-01 | Settings generales del workspace | Página | Nombre del workspace. Zona de peligro: eliminar workspace (solo Admin). |
| SET-02 | Gestión de miembros | Página | Lista de miembros con su rol. Acciones: cambiar rol, remover miembro (solo Admin). |
| SET-03 | Invitar miembro | Modal | Email + selección de rol (Editor/Viewer). Botón "Enviar invitación". |
| SET-04 | Transferir rol Admin | Modal | Selección de miembro + confirmación. Solo aparece cuando el Admin intenta salir del workspace. |
| SET-05 | Perfil de usuario | Página | Nombre, email (no editable), cambio de contraseña. Zona: cerrar sesión en todos los dispositivos. |

> **Nota SET-03/04:** son flujos definidos en el sistema de roles que no existían en el mapa original. Sin SET-04, la regla de negocio "workspace siempre tiene al menos un Admin" no tiene representación en la UI.

---

### 5. Documentos

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| DOC-01 | Lista de documentos por carpeta | Página | Documentos con indicador de Versión Actual, autor, fecha de última modificación. Filtros: nombre, fecha creación, fecha modificación. |
| DOC-02 | Crear documento | Modal | Nombre del documento. Se crea y se abre el editor automáticamente. |
| DOC-03 | Importar documento | Modal/drawer | Ver sección 10 (Importación). |
| DOC-04 | Menú de acciones del documento | Dropdown contextual | Renombrar, mover a otra carpeta, gestionar acceso, eliminar (Admin). Accesible desde la lista y desde el editor. |
| DOC-05 | Gestión de acceso al documento | Modal | Lista de miembros con acceso + su rol. Añadir Viewer. Toggle "puede ver historial". Solo Editor/Admin. |
| DOC-06 | Empty state: carpeta sin documentos | Estado | CTA: "Crear documento" o "Importar documento". |

> **Nota DOC-04:** es nuevo y resuelve acciones que en el mapa original estaban sin pantalla asignada (renombrar, mover, eliminar documento). Un dropdown contextual evita pantallas adicionales para acciones secundarias.

> **Nota DOC-05:** en el mapa original "Permisos por documento" estaba listado como pantalla propia de la sección de documentos. Se convierte en modal accesible desde dentro del documento para mantener el contexto.

---

### 6. Editor y versiones

El editor es la pantalla más compleja de la aplicación. Tiene zonas funcionales bien diferenciadas: barra superior, área de edición, panel lateral de versiones.

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| ED-01 | Editor — borrador activo | Página completa | Barra superior: título del doc, estado de autoguardado, botones "Guardar Versión" y "Compartir". Panel lateral colapsable: historial de versiones. |
| ED-02 | Editor — modal "Guardar versión" | Modal sobre el editor | Campos: nombre de versión (requerido), comentario (opcional). Checkbox: "Marcar como Versión Actual al guardar". |
| ED-03 | Editor — banner de conflicto | Banner in-context | Aparece en el editor cuando el sistema detecta conflicto de guardado simultáneo. Botón "Ver conflicto" → lleva a MRG-01. |
| ED-04 | Historial de versiones | Panel lateral del editor | Lista de versiones con nombre, autor, fecha, badge "Versión Actual". Click en versión → abre ED-05. |
| ED-05 | Vista de versión específica (solo lectura) | Overlay / modal fullscreen | Versión inmutable en modo lectura. Botones: "Marcar como Versión Actual", "Comparar con...", cerrar. |
| ED-06 | Modal "Marcar como Versión Actual" | Modal de confirmación | Muestra qué versión quedará como actual. Botón confirmar. Notifica al resto del equipo. |
| ED-07 | Modal "Eliminar versión borrador" | Modal de confirmación | Warning: "Esta acción no puede deshacerse." Solo disponible para borradores propios (Editor) o cualquier borrador (Admin). |
| ED-08 | Modal "Eliminar Versión Actual" | Modal de confirmación destructiva | Warning explícito: lista los links activos que quedarán rotos. Solo Admin. Campo de confirmación por texto. |
| ED-09 | Empty state: documento sin versiones | Estado en panel lateral | Aparece cuando el documento fue creado pero nunca se guardó una versión. Texto orientativo. |

> **Nota ED-02:** el checkbox "Marcar como Versión Actual al guardar" es un añadido importante. Evita el flujo de dos pasos (guardar versión → luego marcarla) en el caso más común donde el editor quiere hacer ambas cosas a la vez.

> **Nota ED-03:** el banner de conflicto es nuevo y crítico. Sin él, el editor que tiene un conflicto no recibe ninguna señal visual mientras trabaja.

> **Nota ED-08:** la confirmación por texto ("escribe el nombre del documento para confirmar") es el estándar UX para acciones destructivas irreversibles con consecuencias en cascada.

---

### 7. Comparación y Merge

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| CMP-01 | Comparador — selector de versiones | Página | Dos dropdowns de selección de versión. Por defecto: las dos más recientes. Botón "Comparar". |
| CMP-02 | Comparador — diff visual lado a lado | Página | Panel de resumen colapsable (N modificadas / N eliminadas / N añadidas). Vista lado a lado. Navegación entre cambios. |
| CMP-03 | Comparador — vista unificada (alternativa) | Toggle en CMP-02 | Diff en una sola columna con marcas de color. Útil en pantallas pequeñas. |
| MRG-01 | Editor de merge | Página completa | Accesible desde la notificación de conflicto o desde el historial. Muestra las dos versiones en conflicto. Por cada bloque divergente: botón "Usar A", "Usar B", o editar manualmente. |
| MRG-02 | Modal "Guardar resultado del merge" | Modal sobre MRG-01 | Nombre de versión (pre-relleno: "Merge de v1.3 y v1.3b"), comentario. Checkbox "Marcar como Versión Actual". |

> **Nota CMP-03:** la vista unificada es un toggle dentro del comparador, no una pantalla aparte. Es un añadido de bajo costo que mejora mucho la usabilidad en laptops con pantallas de 13".

> **Nota MRG-01/02:** completamente nuevas. El mapa original no tenía ninguna representación del flujo de merge a pesar de que está completamente definido en el AF.

---

### 8. Compartir

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| SHR-01 | Modal "Compartir documento" | Modal | Dos pestañas: "Link dinámico" y "Link fijo". Para link dinámico: toggle "permitir ver historial". Para link fijo: selector de versión + toggle historial. Botón "Copiar link". |
| SHR-02 | Links activos del documento | Sección en SHR-01 o panel | Lista de links generados: tipo (fijo/dinámico), versión apuntada, fecha de creación, estado (activo/revocado). Botón "Revocar". |
| SHR-03 | Vista pública por link — Versión Actual | Página sin auth | Layout simplificado. Header con nombre del documento y badge "Versión Actual". Contenido en solo lectura. Botón "Ver historial" si el link lo permite. |
| SHR-04 | Vista pública por link — versión específica | Página sin auth | Igual que SHR-03 pero con badge "Versión [nombre]" y banner "Esta es una versión archivada, no la más reciente". |
| SHR-05 | Vista pública — link revocado o versión eliminada | Página de estado | Mensaje: "Este documento ya no está disponible. Contactá al propietario." Sin ningún contenido expuesto. |

> **Nota SHR-01:** el modal original de "generar link fijo" y "generar link dinámico" como dos pantallas separadas se unifica en un solo modal con pestañas. Reduce la fricción y es más intuitivo.

> **Nota SHR-02:** los links activos del documento son un añadido necesario para que el Editor pueda gestionar (y revocar) lo que ya compartió. Sin esta vista, compartir es una acción ciega.

> **Nota SHR-04:** el banner "versión archivada" es crítico para que el receptor de un link fijo entienda que puede existir una versión más nueva.

---

### 9. Notificaciones

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| NOT-01 | Feed de notificaciones | Panel lateral / dropdown | Lista cronológica. Agrupada por documento. Badge de contador en el header. |
| NOT-02 | Notificación: nueva Versión Actual | Item en NOT-01 | "[Nombre] publicó v2.0 en [Documento]". Click → abre ED-05 en esa versión. |
| NOT-03 | Notificación: conflicto de guardado | Item en NOT-01 | "[Nombre] guardó una versión simultánea en [Documento]". Click → abre MRG-01. |
| NOT-04 | Notificación: invitación a workspace/documento | Item en NOT-01 | "Fuiste agregado al workspace [Nombre] como [Rol]". Click → abre el workspace/documento. |
| NOT-05 | Empty state: sin notificaciones | Estado en NOT-01 | "Todo al día. Aquí aparecerán los cambios del equipo." |

> **Nota:** el mapa original tenía "Detalle de notificación" como pantalla propia. Se reemplaza por el modelo más común: cada notificación lleva directamente al contexto relevante (la versión, el merge, el documento). Una pantalla de "detalle" separada agrega un paso innecesario.

---

### 10. Importación

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| IMP-01 | Modal de importación — selección de archivo | Modal (paso 1) | Zona de drag & drop + botón "Seleccionar archivo". Formatos aceptados: `.docx`. Tamaño máximo visible. |
| IMP-02 | Modal de importación — procesando | Modal (paso 2) | Spinner / barra de progreso. No se puede cerrar mientras procesa. |
| IMP-03 | Modal de importación — resultado exitoso | Modal (paso 3) | "Documento importado como v1.0". Botón "Abrir en editor". Si hubo warnings → muestra sección expandible. |
| IMP-04 | Modal de importación — warnings de formato | Sección en IMP-03 | Lista de elementos omitidos: "2 tablas omitidas, 1 imagen embebida omitida". Enlace "¿Por qué?" con explicación. |
| IMP-05 | Modal de importación — error | Modal de error | Archivo inválido, demasiado grande, formato no soportado. Botón "Intentar de nuevo". |

> **Nota:** el mapa original tenía "Subir .docx" y "Resultado de importación" como dos ítems. Se expande a un flujo de 3 estados (selección → procesando → resultado) que es como realmente funciona una importación asíncrona y evita que el usuario no sepa qué está pasando.

---

### 11. Estados de error globales

Pantallas independientes accesibles directamente por URL, no en el flujo normal de la app.

| ID | Pantalla | Tipo | Notas |
|---|---|---|---|
| ERR-01 | 404 — Página no encontrada | Página de error | Navegación de vuelta al workspace. |
| ERR-02 | 403 — Sin permisos | Página de error | "No tenés acceso a este recurso." Distinción entre "no existe" y "no tenés permiso" es importante por seguridad. |
| ERR-03 | Token de invitación inválido o expirado | Página de error | "Esta invitación ya no es válida." Botón "Ir al login" o "Solicitar nueva invitación". |
| ERR-04 | Workspace eliminado | Página de error | "Este workspace ya no existe." Solo Admin puede ver qué pasó. |

---

## Vista del mapa completo

```
VERSIONLY — Mapa de pantallas v1.1
════════════════════════════════════════════════════════════

1. AUTENTICACIÓN (7 pantallas)
   AUTH-01  Registro
   AUTH-02  Login
   AUTH-03  Verificación de email — pendiente
   AUTH-04  Verificación de email — exitosa         [NEW]
   AUTH-05  Recuperación de contraseña — solicitud
   AUTH-06  Recuperación de contraseña — nueva pass
   AUTH-07  Token inválido / expirado               [NEW]

2. ONBOARDING (4 pasos)
   ON-01    Paso 1: Crear workspace
   ON-02    Paso 2: Crear proyecto
   ON-03    Paso 3: Crear carpeta                   [NEW]
   ON-04    Paso 4: Primera acción                  [NEW]

3. WORKSPACE Y NAVEGACIÓN (6 vistas)
   WS-01    Selector de workspace
   WS-02    Home de workspace                        [NEW]
   WS-03    Lista de proyectos
   WS-04    Vista de proyecto (carpetas)
   WS-05    Empty state: workspace sin proyectos     [NEW]
   WS-06    Empty state: proyecto sin carpetas       [NEW]

4. SETTINGS Y MIEMBROS (5 pantallas) — SECCIÓN NUEVA
   SET-01   Settings generales del workspace        [NEW]
   SET-02   Gestión de miembros                     [NEW]
   SET-03   Modal: Invitar miembro                  [NEW]
   SET-04   Modal: Transferir rol Admin             [NEW]
   SET-05   Perfil de usuario / cuenta              [NEW]

5. DOCUMENTOS (6 vistas)
   DOC-01   Lista de documentos por carpeta
   DOC-02   Modal: Crear documento
   DOC-03   Modal: Importar documento → flujo IMP
   DOC-04   Dropdown: Menú de acciones              [NEW]
   DOC-05   Modal: Gestión de acceso al documento   [MOVED]
   DOC-06   Empty state: carpeta sin documentos     [NEW]

6. EDITOR Y VERSIONES (9 vistas)
   ED-01    Editor — borrador activo
   ED-02    Modal: Guardar versión                  [EXPANDED]
   ED-03    Banner: Conflicto detectado             [NEW]
   ED-04    Panel: Historial de versiones
   ED-05    Vista de versión específica (solo lectura)
   ED-06    Modal: Marcar como Versión Actual       [NEW]
   ED-07    Modal: Eliminar versión borrador        [NEW]
   ED-08    Modal: Eliminar Versión Actual          [NEW]
   ED-09    Empty state: sin versiones guardadas    [NEW]

7. COMPARACIÓN Y MERGE (5 vistas)
   CMP-01   Comparador — selector de versiones
   CMP-02   Comparador — diff visual lado a lado
   CMP-03   Comparador — vista unificada (toggle)   [NEW]
   MRG-01   Editor de merge                         [NEW]
   MRG-02   Modal: Guardar resultado del merge      [NEW]

8. COMPARTIR (5 vistas)
   SHR-01   Modal: Compartir documento              [MERGED]
   SHR-02   Panel: Links activos y revocación       [NEW]
   SHR-03   Vista pública — Versión Actual
   SHR-04   Vista pública — versión específica      [NEW]
   SHR-05   Vista pública — link no disponible      [NEW]

9. NOTIFICACIONES (5 vistas)
   NOT-01   Feed de notificaciones
   NOT-02   Item: nueva Versión Actual              [DETAILED]
   NOT-03   Item: conflicto de guardado             [NEW]
   NOT-04   Item: invitación                        [NEW]
   NOT-05   Empty state: sin notificaciones         [NEW]

10. IMPORTACIÓN (5 vistas)
    IMP-01  Modal paso 1: selección de archivo
    IMP-02  Modal paso 2: procesando                [NEW]
    IMP-03  Modal paso 3: resultado exitoso
    IMP-04  Sección: warnings de formato            [NEW]
    IMP-05  Modal: error de importación             [NEW]

11. ERRORES GLOBALES (4 páginas) — SECCIÓN NUEVA
    ERR-01  404 — No encontrado                     [NEW]
    ERR-02  403 — Sin permisos                      [NEW]
    ERR-03  Token de invitación inválido            [NEW]
    ERR-04  Workspace eliminado                     [NEW]

════════════════════════════════════════════════════════════
TOTAL: 52 vistas  |  [NEW]: 29  |  [MOVED/MERGED]: 3
════════════════════════════════════════════════════════════
```

---

## Pantallas por rol de usuario

Qué ve cada rol cuando accede a la aplicación:

### Admin
Acceso completo. Adicionalmente ve:
- SET-01, SET-02, SET-03, SET-04 (settings y miembros)
- ED-08 (eliminar Versión Actual — solo Admin)
- Botón eliminar documento en DOC-04

### Editor
- Todo el flujo de edición, versiones, comparación, merge, compartir.
- DOC-05 (gestión de acceso a documentos propios).
- NO ve SET-01/02 (settings de workspace).

### Viewer interno
- DOC-01 (lista), ED-04 (historial si tiene permiso), ED-05 (versión específica), CMP-01/02 (diff, solo lectura).
- NOT-01 (notificaciones).
- NO ve: ED-01 (editor), ED-02 (guardar versión), MRG-01 (merge).

### Viewer externo (sin cuenta)
- Solo SHR-03 o SHR-04 (vista pública del documento).
- Si el link permite historial: ED-04 simplificado, CMP-01/02 de solo lectura.

---

## Priorización para desarrollo

Orden sugerido de implementación por valor y dependencias:

| Fase | Pantallas | Criterio |
|---|---|---|
| **Fase 1 — Core bloqueante** | AUTH-01 a 06, ON-01 a 04, WS-01 a 04, DOC-01/02, ED-01/02/04/05 | Sin esto no hay producto |
| **Fase 2 — Flujo completo** | ED-06, SHR-01/03, NOT-01 a 04, IMP-01/03 | Cierra el loop principal |
| **Fase 3 — Robustez** | CMP-01/02, MRG-01/02, ED-03, ED-07/08, SET-01 a 04 | Cubre reglas de negocio y admin |
| **Fase 4 — Pulido** | Todos los empty states, ERR-01 a 04, SHR-02/04/05, vistas extras | UX completa |

---

*Documento vivo — actualizar con cada sprint. Versión 1.1 generada a partir del mapa original v1.0.*