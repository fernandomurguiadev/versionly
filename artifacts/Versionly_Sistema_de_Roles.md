# Versionly — Sistema de Roles
**Versión 1.0 · Febrero 2025**

---

## Tabla de Contenidos

1. [Resumen del modelo](#1-resumen-del-modelo)
2. [Roles definidos](#2-roles-definidos)
3. [Matriz de permisos completa](#3-matriz-de-permisos-completa)
4. [Asignación de roles](#4-asignación-de-roles)
5. [Reglas de negocio](#5-reglas-de-negocio)
6. [Casos borde y comportamientos esperados](#6-casos-borde-y-comportamientos-esperados)
7. [Flujos de acceso por rol](#7-flujos-de-acceso-por-rol)

---

## 1. Resumen del modelo

El sistema de roles de Versionly opera en **dos niveles independientes**:

- **Nivel Workspace** — define qué puede hacer un usuario dentro de todo el workspace.
- **Nivel Documento** — permite afinar el acceso a un documento específico, independientemente del rol en el workspace.

Un usuario puede tener el rol Viewer en el workspace pero ser Editor en un documento puntual. El nivel documento **siempre prevalece** sobre el nivel workspace cuando hay diferencia, en la dirección que amplía el acceso.

```
Workspace
├── Admin del workspace         → acceso total
├── Editor del workspace        → puede crear y editar en todo el workspace
└── Viewer del workspace        → solo lectura en todo el workspace
    └── Documento específico
        └── Editor del documento → puede editar este doc aunque sea Viewer del workspace
```

---

## 2. Roles definidos

### 2.1 Admin

El Administrador es el propietario operativo del workspace. Existe **al menos uno por workspace** y es quien lo creó por defecto. Puede haber más de un Admin por workspace.

**Responsabilidades:**
- Gestionar la estructura del workspace: crear, renombrar y eliminar proyectos y carpetas.
- Invitar y remover usuarios del workspace, y asignarles roles.
- Reasignar el rol Editor de un documento a otro usuario.
- Ejecutar acciones destructivas: eliminar versiones finales, eliminar documentos completos.
- Es el único que puede eliminar la Versión Actual de un documento (con confirmación obligatoria).
- Es el único que puede eliminar un documento con su historial completo (con confirmación obligatoria y advertencia explícita de irreversibilidad).

**Lo que NO puede hacer (restricciones intencionales):**
- No puede editar el contenido de un documento del que no es Editor, a menos que se asigne a sí mismo como Editor.
- No puede recuperar datos eliminados (las eliminaciones son permanentes).

---

### 2.2 Editor

El Editor es el responsable funcional de uno o más documentos. Es el único rol que puede modificar el contenido y gestionar el ciclo de vida de las versiones.

**Responsabilidades:**
- Crear, editar y guardar versiones nombradas de documentos bajo su responsabilidad.
- Marcar una versión como Versión Actual (publicación).
- Eliminar versiones en estado borrador que él mismo haya guardado.
- Generar y compartir links de acceso (fijos o dinámicos).
- Dar acceso de Viewer a usuarios específicos sobre un documento de su responsabilidad.
- Importar documentos externos y crear la versión inicial.

**Lo que NO puede hacer:**
- No puede eliminar la Versión Actual de un documento (requiere Admin).
- No puede eliminar versiones guardadas por otros Editores.
- No puede eliminar un documento completo (requiere Admin).
- No puede gestionar usuarios a nivel workspace.

---

### 2.3 Viewer

El Viewer es un usuario con acceso de solo lectura. Puede ser miembro del workspace o simplemente un receptor de un link compartido.

**Tipos de Viewer:**

| Tipo | Cómo accede | Qué puede ver |
|---|---|---|
| **Viewer interno** | Invitado al workspace o al documento con este rol | Versión Actual + historial de versiones (si el Editor lo permite al compartir) |
| **Viewer externo** | Recibe un link compartido, no necesita cuenta | Solo el documento que corresponde al link (fijo o dinámico) |

**Lo que puede hacer:**
- Ver la Versión Actual del documento.
- Navegar el historial de versiones (si tiene permiso habilitado).
- Ver el diff entre versiones (solo lectura, no puede intervenir).
- Recibir notificaciones in-app cuando se publica una nueva Versión Actual (Viewer interno únicamente).

**Lo que NO puede hacer:**
- No puede editar ningún documento.
- No puede guardar versiones.
- No puede compartir links.
- No puede ver el borrador activo del Editor.

---

## 3. Matriz de permisos completa

### 3.1 Gestión del workspace

| Acción | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| Crear workspace | ✅ | ✅ (propio) | ✅ (propio) |
| Renombrar workspace | ✅ | — | — |
| Eliminar workspace | ✅ | — | — |
| Crear proyectos | ✅ | — | — |
| Renombrar / eliminar proyectos | ✅ | — | — |
| Crear carpetas | ✅ | ✅ | — |
| Renombrar / eliminar carpetas | ✅ | ✅ (propias) | — |
| Invitar usuarios al workspace | ✅ | — | — |
| Remover usuarios del workspace | ✅ | — | — |
| Cambiar rol de usuario en workspace | ✅ | — | — |

> **Nota:** cualquier usuario autenticado puede crear su propio workspace. El rol Admin aplica dentro de un workspace específico, no es un rol global de la plataforma.

---

### 3.2 Gestión de documentos

| Acción | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| Crear documento (dentro de carpeta) | ✅ | ✅ | — |
| Importar documento externo | ✅ | ✅ | — |
| Editar contenido del documento | ✅ | ✅ | — |
| Ver borrador activo | ✅ | ✅ | — |
| Eliminar documento completo *(con warning)* | ✅ | — | — |
| Asignar Editor a un documento | ✅ | — | — |
| Dar acceso Viewer a un documento | ✅ | ✅ | — |

---

### 3.3 Gestión de versiones

| Acción | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| Guardar versión nombrada | ✅ | ✅ | — |
| Marcar versión como Versión Actual | ✅ | ✅ | — |
| Ver historial de versiones | ✅ | ✅ | ✅ (si permitido) |
| Ver versión específica (solo lectura) | ✅ | ✅ | ✅ (si permitido) |
| Eliminar versión borrador propia | ✅ | ✅ | — |
| Eliminar versión borrador ajena | ✅ | — | — |
| Eliminar Versión Actual *(con warning)* | ✅ | — | — |

---

### 3.4 Comparación y merge

| Acción | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| Ver diff entre dos versiones | ✅ | ✅ | ✅ (si tiene acceso al historial) |
| Iniciar merge entre versiones en conflicto | ✅ | ✅ | — |
| Guardar resultado del merge como nueva versión | ✅ | ✅ | — |

---

### 3.5 Compartir y acceso externo

| Acción | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| Generar link dinámico (apunta a Versión Actual) | ✅ | ✅ | — |
| Generar link fijo (apunta a versión específica) | ✅ | ✅ | — |
| Revocar link compartido | ✅ | ✅ | — |
| Acceder por link sin cuenta (Viewer externo) | — | — | ✅ |

---

### 3.6 Notificaciones

| Evento | Admin | Editor | Viewer interno | Viewer externo |
|---|:---:|:---:|:---:|:---:|
| Nueva Versión Actual publicada | ✅ | ✅ | ✅ | — |
| Conflicto de guardado simultáneo | ✅ | ✅ (involucrados) | — | — |
| Invitación a workspace o documento | ✅ | ✅ | ✅ | — |

---

### 3.7 Integración Google Drive *(v1.1)*

| Acción | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| Conectar Google Drive al workspace | ✅ | ❌ | ❌ |
| Revocar conexión Google Drive | ✅ | ❌ | ❌ |
| Importar documento desde Drive picker | ✅ | ✅ | ❌ |
| Ver estado de sincronización Drive | ✅ | ✅ | ❌ |

---

## 4. Asignación de roles

### 4.1 A nivel workspace

El Admin invita a un usuario ingresando su email y seleccionando el rol: Editor o Viewer. El usuario invitado recibe una notificación in-app (y en futuras versiones, un email). Si el usuario aún no tiene cuenta, se le enviará un link de registro que lo incorpora directamente al workspace al completarlo.

```
Admin → "Invitar usuario" → ingresa email + selecciona rol
  → si el usuario existe: notificación in-app
  → si el usuario no existe: link de registro con acceso pre-configurado
```

### 4.2 A nivel documento

Un Editor puede dar acceso de Viewer a usuarios específicos sobre un documento de su responsabilidad, sin necesidad de que esos usuarios sean miembros del workspace. Un Admin puede además asignar el rol Editor a cualquier usuario del workspace sobre cualquier documento.

```
Editor → "Compartir acceso interno" → ingresa email + rol Viewer
Admin  → "Asignar Editor" → selecciona usuario del workspace
```

### 4.3 Tabla resumen de quién puede asignar qué

| Acción de asignación | Quién puede hacerlo |
|---|---|
| Asignar Admin en workspace | Admin (solo puede haber uno inicial; puede promover a otro) |
| Asignar Editor en workspace | Admin |
| Asignar Viewer en workspace | Admin |
| Asignar Editor en documento específico | Admin |
| Asignar Viewer en documento específico | Admin, Editor del documento |
| Acceso por link (Viewer externo) | Cualquiera que tenga el link |

---

## 5. Reglas de negocio

1. **Un workspace siempre tiene al menos un Admin.** Si el único Admin intenta abandonar el workspace, el sistema debe solicitarle que transfiera el rol Admin a otro usuario antes de proceder.

2. **La Versión Actual es única por documento.** Solo puede existir una versión marcada como Versión Actual por documento en cualquier momento. Al marcar una nueva, el sistema desactiva automáticamente la anterior.

3. **Las versiones guardadas son inmutables.** Una vez guardada una versión nombrada, su contenido no puede modificarse bajo ningún rol. Solo puede eliminarse (con las restricciones del rol correspondiente).

4. **El borrador activo no es una versión.** No aparece en el historial, no tiene nombre, no puede compartirse y no es visible para Viewers. Es el espacio de trabajo privado del Editor.

5. **Las eliminaciones destructivas requieren confirmación explícita.** Eliminar la Versión Actual o un documento completo muestra un diálogo de advertencia que detalla exactamente qué se perderá. No hay papelera ni recuperación.

6. **Un Viewer externo no necesita cuenta.** El acceso por link es anónimo desde el punto de vista de Versionly. El sistema registra el acceso (timestamp, IP) pero no asocia la visita a un usuario.

7. **El rol más amplio prevalece cuando hay conflicto entre niveles.** Si un usuario es Viewer en el workspace pero Editor de un documento específico, puede editar ese documento. El sistema siempre evalúa el permiso más permisivo disponible para la acción solicitada.

8. **Un Editor solo puede eliminar sus propias versiones borrador.** No puede eliminar versiones borrador guardadas por otro Editor sobre el mismo documento.

9. **Solo el Admin del workspace puede iniciar y revocar la conexión OAuth2 con Google Drive.** *(v1.1)*

10. **Un Editor puede usar el Drive picker para importar archivos, pero requiere que el Admin haya conectado previamente el workspace.** *(v1.1)*

11. **Las versiones creadas desde Drive import se registran con `source='google_drive'` y autor sistema.** *(v1.1)*

12. **Revocar la conexión OAuth no elimina versiones ya importadas.** El historial de versiones provenientes de Drive permanece intacto. *(v1.1)*

---

## 6. Casos borde y comportamientos esperados

| Escenario | Comportamiento esperado |
|---|---|
| El único Admin abandona el workspace | Sistema bloquea la acción y solicita transferir el rol Admin primero. |
| Se elimina la Versión Actual y hay links dinámicos activos | Los links muestran la página de estado: *"Esta versión ya no está disponible."* |
| Se elimina un documento completo con links compartidos activos | Todos los links (fijos y dinámicos) muestran la página de estado. |
| Un Editor intenta eliminar una versión que no es suya | El sistema deniega la acción. No hay mensaje de error técnico; solo indica que no tiene permiso para esa operación. |
| Un Viewer intenta acceder al borrador activo vía URL directa | El sistema devuelve la Versión Actual. El borrador no es accesible por URL bajo ninguna circunstancia. |
| Dos Admins marcan Versión Actual al mismo tiempo | El sistema aplica la última escritura confirmada por el servidor. El otro Admin recibe una notificación indicando que la Versión Actual fue actualizada por [Nombre]. |
| Un usuario es removido del workspace pero tiene links compartidos activos | Los links siguen funcionando (son públicos). Los links internos con su cuenta dejan de ser accesibles. Su nombre permanece en el historial de versiones que guardó (registro histórico). |
| Se invita a un email que ya tiene cuenta con otro workspace | El sistema reconoce la cuenta existente y la vincula al nuevo workspace sin crear un duplicado. |

---

## 7. Flujos de acceso por rol

### Flujo: Usuario se registra y crea su primer workspace

```
Registro con email + password
  → verificación de email
  → onboarding: crear workspace → crear proyecto → crear carpeta
  → rol asignado automáticamente: Admin del workspace creado
```

### Flujo: Admin invita a un Editor

```
Admin → "Invitar usuario" → email + rol Editor
  → sistema envía notificación in-app
  → Editor acepta → accede al workspace con su rol
  → puede crear y editar documentos dentro de cualquier carpeta del workspace
```

### Flujo: Editor comparte un documento con un Viewer externo

```
Editor → abre documento → "Compartir"
  → elige tipo de link: dinámico o fijo
  → copia el link → lo envía por fuera de Versionly (email, Slack, etc.)
  → Viewer externo abre el link sin cuenta
  → ve el documento en solo lectura
  → no puede editar, no puede comentar, no puede compartir
```

### Flujo: Viewer interno recibe notificación de nueva versión

```
Editor publica nueva Versión Actual
  → sistema genera notificación in-app
  → todos los Viewers y Editores del documento la reciben
  → Viewer hace click en la notificación
  → se abre el documento mostrando la nueva Versión Actual
```

---

*Documento sujeto a revisión. Versión 1.0 — MVP.*
