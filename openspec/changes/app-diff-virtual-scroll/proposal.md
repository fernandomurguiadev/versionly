# Proposal: app-diff-virtual-scroll

## Intent

Aunque el colapso de secciones iguales reduce drásticamente las filas visibles, un documento con muchos cambios dispersos puede seguir teniendo 500+ filas activas. Cada nodo DOM tiene un costo de memoria y layout. Con 500+ filas en pantalla el scroll empieza a tener jank. El virtualizer resuelve esto manteniendo siempre ~60 nodos en el DOM independientemente del tamaño total del diff.

## Scope

- Reemplazar `<table>` por layout `<div>` compatible con virtualización
- Integrar `useVirtualizer` de `@tanstack/react-virtual` en `SplitView`
- `estimateSize` con medición real via `measureElement`
- No incluye: virtualización del InlineView (el texto fluye naturalmente)
- Depende de: `app-diff-collapse-equal-sections` (trabaja sobre `FlatItem[]`)

## Approach

`@tanstack/react-virtual` ya forma parte del ecosistema del proyecto (mismo vendor que TanStack Query). El virtualizer recibe el array `FlatItem[]` (post-colapso) y renderiza solo los items visibles usando `position: absolute` + `top: vItem.start`. El contenedor scrolleable tiene `position: relative` y altura igual a `virtualizer.getTotalSize()`.
