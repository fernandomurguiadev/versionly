# Reglas Principales del Proyecto — Versionly

## 1. Fuente de verdad
Las decisiones funcionales y técnicas se rigen por los artifacts del directorio `artifacts/`. En caso de conflicto, aplicar el orden de precedencia definido en `Versionly_Reglas_Generales.md`.

## 2. Alcance MVP
- Enfocar en versionado intencional, diff visual y compartir con links fijos/dinámicos.
- No implementar colaboración en tiempo real ni exportaciones en el MVP.
- Notificaciones in-app vía SSE.

## 3. Reglas de dominio
- Jerarquía obligatoria: Workspace → Proyecto → Carpeta → Documento.
- Solo una Versión Actual por documento.
- Versiones inmutables; nuevos cambios crean nuevas versiones.

## 4. Convenciones de trabajo
- Registrar incongruencias y riesgos en `artifacts/Versionly_Log_Incidencias.md`.
- Cualquier cambio de alcance o stack debe reflejarse en los artifacts correspondientes.
- En el frontend (Angular 19) no se usan NgModules; todo debe ser standalone.
- Ningún archivo de código debe superar 200 líneas.

