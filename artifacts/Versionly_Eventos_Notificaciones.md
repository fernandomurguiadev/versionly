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

