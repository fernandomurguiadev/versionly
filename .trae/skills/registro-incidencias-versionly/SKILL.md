---
name: "registro-incidencias-versionly"
description: "Logs project issues and suggested fixes to a markdown file. Invoke when you detect inconsistencies, architectural problems, or risks during development."
---

# Registro de Incidencias Versionly

Esta skill registra incidencias del proyecto en un archivo markdown con fecha y hora.

## Cuándo invocarla
- Cuando se detecten incongruencias entre artifacts.
- Cuando aparezcan problemas de diseño de arquitectura o decisiones técnicas dudosas.
- Cuando se identifiquen riesgos funcionales o de seguridad.
- Cuando haya sugerencias claras de corrección o mitigación.

## Archivo de destino
- `artifacts/Versionly_Log_Incidencias.md`

## Formato del registro
**Formato rápido**
```
[YYYY-MM-DD HH:MM] Tipo | Severidad | Área | Estado | Descripción | Sugerencia
```

**Formato detallado (tabla)**
| ID | Fecha | Tipo | Severidad | Área | Estado | Descripción | Impacto | Sugerencia | Referencias |
|---|---|---|---|---|---|---|---|---|---|

## Tipos sugeridos
- Incongruencia
- Diseño
- Seguridad
- Performance
- UX
- Operación
- Dependencias

## Pasos
1) Identificar el problema y su impacto.
2) Proponer una sugerencia concreta de corrección o mitigación.
3) Agregar una línea nueva al final del archivo con la marca temporal local.

## Ejemplo
```
[2026-02-21 14:32] Incongruencia | Media | Backend | Pendiente | El stack sugiere Redis para borradores pero el análisis funcional no lo menciona | Confirmar si el borrador activo se persiste en Redis y documentarlo en el análisis funcional
```
