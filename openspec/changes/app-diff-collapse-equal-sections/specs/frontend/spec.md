# Delta: frontend — app-diff-collapse-equal-sections

## ADDED Requirements

### Requirement: Colapso automático de secciones iguales
El sistema SHALL colapsar automáticamente bloques de líneas iguales que excedan 2×contextLines filas en la vista de diff.

#### Scenario: Bloque grande colapsado por defecto
- GIVEN un diff con 50 líneas iguales consecutivas y contextLines = 5
- WHEN se renderiza la vista lado a lado
- THEN se muestran 5 líneas de contexto, un botón "50 líneas sin cambios · Expandir", y 5 líneas de contexto

#### Scenario: Bloque pequeño no colapsado
- GIVEN un diff con 8 líneas iguales consecutivas y contextLines = 5
- WHEN se renderiza la vista lado a lado
- THEN se muestran las 8 líneas completas sin botón de colapso

#### Scenario: Expandir bloque colapsado
- GIVEN un bloque colapsado visible en el diff
- WHEN el usuario hace click en "Expandir"
- THEN el bloque se reemplaza por todas sus filas sin recargar la página
