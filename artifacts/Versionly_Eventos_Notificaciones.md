# Versionly — Catálogo de Eventos y Notificaciones (MVP)
**Versión 1.0 · Febrero 2026**

---

## 1. Eventos in-app
| Evento | Emisor | Destinatarios | Descripción |
|---|---|---|---|
| version.current.published | Backend | Admin, Editores, Viewers internos | Se publica nueva Versión Actual |
| version.conflict.detected | Backend | Editores involucrados | Conflicto por guardado simultáneo |
| workspace.member.invited | Backend | Usuario invitado | Invitación a workspace |
| document.member.granted | Backend | Usuario asignado | Acceso a documento |
| share.link.revoked | Backend | Editores/Admin | Link revocado |

---

### 1.1 Eventos — Integración Google Drive *(v1.1)*

| Evento | Disparado por | Destinatario | Descripción |
|---|---|---|---|
| drive.connection.established | Sistema | Admin workspace | Conexión OAuth2 con Google Drive establecida exitosamente |
| drive.import.completed | Sistema | Usuario que importó | Documento importado desde Drive — nueva versión creada |
| drive.import.failed | Sistema | Usuario que importó | Error al importar archivo desde Google Drive — detalle del error |
| drive.token.expired | Sistema | Admin workspace | Token OAuth de Google Drive expiró — reconectar para seguir importando |

---

## 2. Canal SSE
**Endpoint sugerido:** `GET /notifications/stream`

**Formato base**
```
event: <tipo>
data: <payload_json>
```

**Payload base**
```
{
  "id": "uuid",
  "type": "version.current.published",
  "createdAt": "2026-02-21T12:10:00Z",
  "payload": {}
}
```

---

## 3. Payloads sugeridos
**version.current.published**
```
{
  "documentId": "uuid",
  "versionId": "uuid",
  "versionName": "v2.0",
  "publishedBy": "userId"
}
```

**version.conflict.detected**
```
{
  "documentId": "uuid",
  "leftVersionId": "uuid",
  "rightVersionId": "uuid"
}
```

---

### 3.1 Payloads — Integración Google Drive *(v1.1)*

**drive.import.completed**
```json
{
  "documentId": "uuid",
  "versionId": "uuid",
  "driveFileName": "especificacion-v2.docx",
  "warningCount": 2
}
```

**drive.token.expired**
```json
{
  "workspaceId": "uuid",
  "connectedEmail": "usuario@gmail.com",
  "expiredAt": "2026-05-28T10:00:00Z"
}
```

