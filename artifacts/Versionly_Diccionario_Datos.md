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
