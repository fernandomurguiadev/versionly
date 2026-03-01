# Versionly — Requerimientos No Funcionales (MVP)
**Versión 1.0 · Febrero 2026**

---

## 1. Rendimiento
- El editor debe responder a entradas del usuario sin bloqueos visibles.
- El autoguardado no debe interrumpir la edición ni generar pérdida de foco.
- El diff visual debe renderizar documentos grandes sin congelar la UI.

## 2. Disponibilidad y continuidad
- El backend debe soportar reconexión de SSE sin pérdida de notificaciones recientes.
- Los borradores activos deben contar con una estrategia de recuperación ante caída.

## 3. Seguridad
- Contraseñas con hash seguro y políticas de expiración de tokens.
- Accesos por link compartido deben tener expiración configurable en versiones futuras.
- Validación estricta de inputs en frontend y backend.

## 4. Escalabilidad
- Versiones almacenadas de forma inmutable y consultables por ID.
- Capa de cache preparada para endpoints de lectura frecuente.

## 5. Observabilidad
- Trazabilidad de errores con contexto de usuario y documento.
- Logs estructurados para acciones críticas (publicación, eliminación, acceso por link).

