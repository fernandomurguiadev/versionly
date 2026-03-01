# Versionly — Reglas Generales del Proyecto
**Versión 1.0 · Febrero 2026 · Documento vivo**

---

## 1. Propósito
Estas reglas consolidan decisiones funcionales y técnicas para mantener consistencia entre frontend, backend y artifacts de producto.

---

## 2. Fuentes canónicas y precedencia
1) **Análisis Funcional MVP** — define alcance, reglas de negocio y flujos principales.  
2) **Reglas Generales del Proyecto** — integra decisiones transversales y criterios de consistencia.  
3) **Stack Tecnológico** — define tecnologías recomendadas y justificación.  
4) **Modelo de Dominio** — entidades, relaciones e invariantes.  
5) **Descripción del Proyecto** — narrativa unificada para onboarding interno.

Ante inconsistencias, prevalece el orden anterior y se registra el hallazgo en el Log de Incidencias.

---

## 3. Principios del MVP
- Enfocar en versionado intencional, comparación precisa y compartir con confianza.
- No incluir colaboración en tiempo real ni exportación a formatos externos en MVP.
- Notificaciones solo in-app, con entrega en tiempo real vía SSE.
- Importación limitada a `.docx` y Google Docs exportado a `.docx`, con warnings explícitos por pérdidas de formato.

---

## 4. Reglas de negocio clave
- Jerarquía obligatoria: Workspace → Proyecto → Carpeta → Documento.
- El borrador activo no es una versión y solo lo ve el Editor.
- Las versiones guardadas son inmutables; solo se crean nuevas versiones.
- Solo puede existir una Versión Actual por documento.
- Roles: Admin (acciones destructivas y gestión), Editor (crear/editar/versionar), Viewer (solo lectura).

---

## 5. Decisiones técnicas del MVP
- Frontend: Angular 19 con Standalone Components, Signals y RxJS.
- Editor: TipTap sobre ProseMirror con salida JSON estructurada.
- Diff: diff-match-patch para texto y diff de nodos sobre JSON.
- Backend: Node.js 22 LTS con NestJS (Fastify) y MySQL 8.0 (JSON).
- Notificaciones: SSE como canal principal.
- Storage de imágenes: S3 compatible (Cloudflare R2 recomendado).

---

## 6. Seguridad y cumplimiento
- Autenticación con JWT y refresh tokens, bcrypt para hash de contraseñas.
- Rate limiting en endpoints críticos como autoguardado.
- Validación de DTOs en backend y validación de formularios en frontend.

---

## 7. Calidad, pruebas y observabilidad
- Testing unitario en frontend y backend con Jest.
- E2E con Playwright para flujos críticos: versionado, diff, compartir.
- Error tracking con Sentry en ambas capas.
- Ningún archivo de código debe superar 200 líneas.

---

## 8. Artefacts obligatorios a considerar
- [Versionly_Analisis_Funcional_MVP.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Analisis_Funcional_MVP.md)
- [Versionly_Stack_Tecnologico.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Stack_Tecnologico.md)
- [Versionly_Modelo_Dominio.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Modelo_Dominio.md)
- [Versionly_Descripcion_Proyecto.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Descripcion_Proyecto.md)
- [Versionly_Sistema_de_Roles.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Sistema_de_Roles.md)
- [Versionly_Requerimientos_No_Funcionales.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Requerimientos_No_Funcionales.md)
- [Versionly_Casos_Uso_MVP.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Casos_Uso_MVP.md)
- [Versionly_API_Contrato_Base.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_API_Contrato_Base.md)
- [Versionly_Plan_Desarrollo.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Plan_Desarrollo.md)
- [Versionly_Schema_MySQL.sql](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Schema_MySQL.sql)
- [Versionly_Estructura_Backend.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Estructura_Backend.md)
- [Versionly_Estructura_Frontend.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Estructura_Frontend.md)
- [Versionly_Spec_Backend.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Spec_Backend.md)
- [Versionly_Spec_Frontend.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Spec_Frontend.md)
- [Versionly_Mapa_Pantallas_MVP.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Mapa_Pantallas_MVP.md)
- [Versionly_Eventos_Notificaciones.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Eventos_Notificaciones.md)
- [Versionly_Diccionario_Datos.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Diccionario_Datos.md)
- [Versionly_Redis.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Redis.md)
- [Versionly_Log_Incidencias.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Log_Incidencias.md)
- [Versionly_Spec_Diseno_UI.md](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/artifacts/Versionly_Spec_Diseno_UI.md)
- [visual-reference-analyzer-versionly](file:///c:/Users/ferna/OneDrive/Documentos/Repositorios/Versionly/.trae/skills/visual-reference-analyzer-versionly/SKILL.md)

