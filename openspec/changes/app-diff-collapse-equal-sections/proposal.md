# Proposal: app-diff-collapse-equal-sections

## Intent

El diff renderer actual muestra todas las filas del documento, incluyendo secciones sin cambios. En un documento de 1.000 líneas con 10 modificaciones puntuales, el usuario ve ~970 filas irrelevantes. Esto hace el diff ilegible y degrada la performance de render. La solución es colapsar automáticamente los bloques iguales y mostrar solo el contexto relevante alrededor de cada cambio, como hace GitHub.

## Scope

- Función `segmentRows(rows, contextLines)` en `src/lib/diff/compute.ts`
- Renderizado por segmentos en `SplitView` con botón "Expandir" por bloque colapsado
- Colapso de texto igual en `InlineView` para bloques > 300 caracteres
- No incluye: virtualización del DOM (change separado), cómputo en Worker (change separado)

## Approach

Agrupar las `DiffRow[]` en segmentos de tipo `changes | context | collapsed`. Los bloques iguales que superen `2 × contextLines` filas se dividen en: cabeza (contextLines filas), bloque colapsado y cola (contextLines filas). Los bloques iguales pequeños se muestran como contexto sin colapsar. El estado de expansión vive en un `Set<number>` de índices de segmento en el componente.
