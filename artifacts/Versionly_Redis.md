# Versionly — Redis en el MVP
**Versión 1.0 · Febrero 2026**

---

## 1. ¿Qué es Redis?
Redis es un almacén de datos en memoria, extremadamente rápido, que soporta estructuras como strings, hashes, listas, sets y streams. Se utiliza para cache, sesiones, rate limiting y pub/sub.

---

## 2. ¿Por qué usar Redis en Versionly?
- Reducir latencia en endpoints críticos como autoguardado.
- Gestionar rate limiting de acciones sensibles.
- Publicar eventos para notificaciones en tiempo real con múltiples instancias.
- Almacenar estados temporales sin afectar la base transaccional.

---

## 3. Usos propuestos en el MVP
**Borrador activo (cache temporal)**
- Clave: `draft:{documentId}`
- Tipo: Hash
- TTL recomendado: 24h

**Rate limiting**
- Clave: `rl:{userId}:{action}`
- Tipo: String
- TTL recomendado: 1m

**Notificaciones SSE (fanout)**
- Canal: `sse:events`
- Tipo: Pub/Sub

---

## 4. Ejemplos
**Guardar borrador**
```
HSET draft:doc_123 content "{...}" updatedBy "user_1" updatedAt "2026-02-21T12:10:00Z"
EXPIRE draft:doc_123 86400
```

**Rate limit para guardado**
```
INCR rl:user_1:save_version
EXPIRE rl:user_1:save_version 60
```

**Publicar evento SSE**
```
PUBLISH sse:events "{\"type\":\"version.current.published\",\"documentId\":\"doc_123\"}"
```

---

## 5. Criterios de persistencia
- Todo dato en Redis es derivable o temporal.
- La fuente de verdad permanece en MySQL.
- Redis se puede reconstruir sin pérdida funcional.
