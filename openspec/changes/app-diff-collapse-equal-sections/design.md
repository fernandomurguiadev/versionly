# Design: app-diff-collapse-equal-sections

## Tipos de segmento

```typescript
type DiffSegment =
  | { type: 'changes';   rows: DiffRow[] }
  | { type: 'context';   rows: DiffRow[] }
  | { type: 'collapsed'; rows: DiffRow[]; count: number };
```

## Algoritmo `segmentRows`

1. Iterar `DiffRow[]` y agrupar filas consecutivas por `isEqual` (tipo `equal`) vs `isChanged`.
2. Para cada grupo igual:
   - Si `count ≤ 2 × contextLines` → `context` segment (no tiene sentido colapsar poco)
   - Si `count > 2 × contextLines` → split en `context` (head) + `collapsed` (mid) + `context` (tail)
3. Para grupos cambiados → `changes` segment directo.

## Estado de expansión

`const [expanded, setExpanded] = useState<Set<number>>(new Set())`

Cada segmento colapsado conoce su índice en el array. Al hacer click en "Expandir", se agrega el índice al Set y el segmento se renderiza como sus filas.

## Flattening para virtual scroll

`flattenSegments(segments, expanded): FlatItem[]` convierte segmentos a items lineales para el virtualizer:
- Segmentos expandidos/context/changes → una `FlatItem` por fila
- Segmentos colapsados no expandidos → una sola `FlatItem` de tipo `collapsed`

## InlineView collapse

Para la vista inline, los bloques `op === 0` con más de 300 caracteres se reemplazan por `head(120) + "[… N caracteres sin cambios …]" + tail(80)`. Un botón "Mostrar documento completo" desactiva el colapso.
