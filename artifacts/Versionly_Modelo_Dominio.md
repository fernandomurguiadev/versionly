# Versionly — Modelo de Dominio (MVP)
**Versión 1.0 · Febrero 2026**

---

## 1. Entidades principales

### 1.1 Usuario
- Identidad básica de acceso.
- Puede pertenecer a múltiples workspaces.

### 1.2 Workspace
- Contenedor principal de proyectos y miembros.
- Tiene administradores y miembros con rol.

### 1.3 WorkspaceMember
- Vincula Usuario ↔ Workspace.
- Rol: Admin, Editor, Viewer.

### 1.4 DocumentMember
- Vincula Usuario ↔ Documento.
- Rol: Editor, Viewer.
- Prevalece sobre el rol a nivel workspace cuando amplía acceso.

### 1.5 Proyecto
- Agrupa carpetas dentro de un workspace.

### 1.6 Carpeta
- Contenedor obligatorio de documentos.

### 1.7 Documento
- Unidad editable y versionable.
- Siempre pertenece a una carpeta.

### 1.8 BorradorActivo
- Estado editable del documento.
- Solo visible para el Editor.

### 1.9 VersionDocumento
- Snapshot inmutable con nombre, comentario, autor y timestamp.
- Solo una puede ser Versión Actual.

### 1.10 LinkCompartido
- Link fijo a una versión específica o link dinámico a Versión Actual.
- Puede permitir acceso sin cuenta.

### 1.11 Notificacion
- Evento in-app asociado a publicación, conflicto o invitación.

---

## 2. Relaciones y cardinalidades
- Un Usuario puede tener muchos Workspaces vía WorkspaceMember.
- Un Workspace tiene muchos Proyectos y muchos WorkspaceMembers.
- Un Documento puede tener muchos DocumentMembers.
- Un Proyecto tiene muchas Carpetas.
- Una Carpeta tiene muchos Documentos.
- Un Documento tiene un BorradorActivo y muchas VersionDocumento.
- Una VersionDocumento pertenece a un Documento y tiene un autor Usuario.
- Un Documento puede tener muchos LinkCompartido.

---

## 3. Invariantes del dominio
- Documento siempre pertenece a Carpeta.
- Carpeta siempre pertenece a Proyecto.
- Proyecto siempre pertenece a Workspace.
- Las VersionDocumento son inmutables.
- Solo existe una Versión Actual por Documento.
- El BorradorActivo no es una versión y no es visible para Viewers.
- Los permisos se evalúan por rol en Workspace o por acceso directo al Documento.
- El rol de documento prevalece cuando amplía el acceso.
- Un workspace debe tener al menos un Admin.
