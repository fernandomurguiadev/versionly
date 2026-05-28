# Delta: frontend — app-diff-virtual-scroll

## ADDED Requirements

### Requirement: DOM virtualizado para diff extenso
El sistema SHALL mantener menos de 100 nodos de fila en el DOM en todo momento, independientemente del tamaño total del diff.

#### Scenario: Diff de 5.000 filas
- GIVEN un diff con 5.000 filas visibles
- WHEN el usuario renderiza la vista lado a lado
- THEN el DOM contiene menos de 100 elementos de fila activos
- AND el scroll es fluido sin jank perceptible

## MODIFIED Requirements

### Requirement: Layout de la vista lado a lado
La vista lado a lado SHALL usar un layout basado en `<div>` en lugar de `<table>` para compatibilidad con virtual scroll.
(Previously: layout basado en `<table>` con `<tr>` y `<td>`)

#### Scenario: Apariencia visual preservada
- GIVEN el cambio de tabla a divs
- WHEN se renderiza el diff
- THEN la apariencia visual (números de línea, colores, bordes, alineación) es idéntica a la versión anterior
