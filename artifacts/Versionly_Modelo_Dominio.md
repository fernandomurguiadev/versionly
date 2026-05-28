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

### 1.12 DriveConnection *(v1.1)*
- Representa la vinculación OAuth2 entre un Usuario de Versionly y su cuenta de Google.
- Almacena los tokens de acceso de forma cifrada.
- Atributos: `id`, `userId`, `workspaceId`, `accessToken` *(cifrado)*, `refreshToken` *(cifrado)*, `tokenExpiresAt`, `scopes`, `createdAt`, `revokedAt`.
- Un usuario puede tener como máximo una `DriveConnection` activa por workspace.

### 1.13 DriveFileMapping *(v1.1)*
- Vincula un Documento de Versionly con un archivo específico en Google Drive.
- Permite rastrear el origen de versiones importadas desde Drive.
- Atributos: `id`, `documentId`, `driveFileId`, `driveFileName`, `driveWebLink`, `lastSyncedAt`, `lastRemoteModifiedAt`, `syncEnabled`.
- Un Documento puede tener como máximo un `DriveFileMapping` (1:0..1).

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
- *(v1.1)* Un Usuario puede tener muchas DriveConnection (1:N), aunque solo una activa por workspace en un momento dado.
- *(v1.1)* Un Documento puede tener a lo sumo un DriveFileMapping (1:0..1).

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
- *(v1.1)* Una DriveConnection tiene scopes mínimos `drive.readonly` y `drive.metadata.readonly`. No se solicitan scopes de escritura.
- *(v1.1)* Los tokens OAuth (`accessToken`, `refreshToken`) se almacenan siempre cifrados en base de datos. Nunca se persisten en texto plano ni se exponen en logs.
- *(v1.1)* La importación desde Drive es intencional: no existe sincronización automática ni polling silencioso en v1.1.
