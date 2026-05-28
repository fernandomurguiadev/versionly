# Tasks: app-diff-collapse-equal-sections

## 1. compute.ts — tipos y función

- [x] 1.1 Agregar tipo `DiffSegment` (changes | context | collapsed)
- [x] 1.2 Implementar `segmentRows(rows, contextLines = 5): DiffSegment[]`
- [x] 1.3 Implementar `flattenSegments(segments, expanded): FlatItem[]` (en page.tsx)

## 2. SplitView — render por segmentos

- [x] 2.1 `useState<Set<number>>` para segmentos expandidos
- [x] 2.2 Renderizar `FlatItem` de tipo `collapsed` como `CollapsedRow` con botón "Expandir"
- [x] 2.3 Renderizar `FlatItem` de tipo `row` como fila normal
- [x] 2.4 Verificar que "Consideraciones de seguridad" aparece a la misma altura en ambas columnas

## 3. InlineView — colapso de texto

- [x] 3.1 Mapear bloques `op === 0` > 300 chars a versión truncada
- [x] 3.2 Botón "Mostrar documento completo" que desactiva el colapso

## 4. Verificación

- [x] 4.1 `npm run typecheck` sin errores
- [x] 4.2 Demo funciona en `/diff-preview` con segmentos colapsables
