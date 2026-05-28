# Versionly — Diccionario de Datos (MVP)
**Versión 1.1 · Febrero 2026**

---

## 1. Usuario
- id
- email
- password_hash
- full_name
- email_verified_at
- created_at
- updated_at

## 2. PasswordResetToken
- id
- user_id
- token
- expires_at
- used_at

## 3. Workspace
- id
- name
- created_by
- created_at
- updated_at

## 4. WorkspaceMember
- id
- workspace_id
- user_id
- role
- created_at

## 5. WorkspaceInvitation
- id
- workspace_id
- email
- role
- token
- expires_at
- accepted_at
- created_by
- created_at

## 6. Proyecto
- id
- workspace_id
- name
- created_at
- updated_at

## 7. Carpeta
- id
- project_id
- name
- created_at
- updated_at

## 8. Documento
- id
- folder_id
- title
- created_by
- created_at
- updated_at

## 9. DocumentMember
- id
- document_id
- user_id
- role
- can_view_history
- created_at

## 10. BorradorActivo
- id
- document_id
- content
- updated_by
- created_at
- updated_at

## 11. VersionDocumento
- id
- document_id
- name
- comment
- content
- created_by
- based_on_version_id
- source
- merge_from_a
- merge_from_b
- import_warnings
- is_current
- drive_file_mapping_id *(FK nullable → DriveFileMapping.id — se establece cuando la versión fue creada mediante una importación desde Google Drive; NULL para versiones creadas en el editor interno o importadas desde archivo local. v1.1)*
- created_at

## 12. DocumentAsset
- id
- document_id
- uploaded_by
- filename
- storage_key
- mime_type
- size_bytes
- created_at

## 13. LinkCompartido
- id
- document_id
- version_id
- token
- mode
- allow_history
- created_by
- created_at
- revoked_at

## 14. Notificacion
- id
- user_id
- type
- document_id
- related_user_id
- payload
- created_at
- read_at

## 15. RefreshToken
- id
- user_id
- token
- expires_at
- revoked_at

---

## 16. DriveConnection *(v1.1)*
> Almacena la vinculación OAuth2 entre un usuario de Versionly y su cuenta de Google Drive.
> **Requisito de seguridad:** `access_token` y `refresh_token` deben almacenarse cifrados (AES-256 o equivalente). Nunca en texto plano ni en logs.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | UUID | PK, NOT NULL | Identificador único de la conexión |
| user_id | UUID | FK → Usuario.id, NOT NULL | Usuario propietario de la conexión |
| workspace_id | UUID | FK → Workspace.id, NOT NULL | Workspace al que pertenece la conexión |
| access_token | TEXT | NOT NULL, cifrado | Token de acceso OAuth2 de Google (expira en ~1 hora). **Almacenar cifrado.** |
| refresh_token | TEXT | NOT NULL, cifrado | Token de renovación OAuth2 de Google. **Almacenar cifrado.** |
| token_expires_at | DATETIME | NOT NULL | Timestamp de expiración del access_token actual |
| scopes | VARCHAR(500) | NOT NULL | Scopes autorizados, ej: `drive.readonly drive.metadata.readonly` |
| created_at | DATETIME | NOT NULL | Fecha de creación de la conexión |
| revoked_at | DATETIME | NULL | Fecha en que el usuario revocó el acceso. NULL si la conexión está activa. |

## 17. DriveFileMapping *(v1.1)*
> Vincula un Documento de Versionly con un archivo específico en Google Drive. Permite rastrear el origen de las versiones importadas.

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | UUID | PK, NOT NULL | Identificador único del mapping |
| document_id | UUID | FK → Documento.id, NOT NULL, UNIQUE | Documento de Versionly vinculado. Un documento tiene a lo sumo un mapping activo. |
| drive_file_id | VARCHAR(200) | NOT NULL | ID del archivo en Google Drive (opaco, asignado por Google) |
| drive_file_name | VARCHAR(500) | NOT NULL | Nombre del archivo en Drive en el momento del último sync |
| drive_web_link | VARCHAR(1000) | NULL | URL web del archivo en Google Drive para referencia del usuario |
| last_synced_at | DATETIME | NULL | Fecha de la última importación exitosa desde este archivo |
| last_remote_modified_at | DATETIME | NULL | Fecha de última modificación del archivo en Drive según la API (para detectar cambios futuros) |
| sync_enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | Indica si el mapping sigue activo. Se puede deshabilitar sin eliminar el registro histórico. |
