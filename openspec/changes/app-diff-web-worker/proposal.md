# Proposal: app-diff-web-worker

## Intent

`computeAlignedLineDiff` y `computeDiff` corren sincrónicamente en el hilo principal. Con documentos grandes (>2.000 líneas) el cómputo puede tardar 2-5 segundos y bloquear completamente la UI: no responde a clicks, scroll ni animaciones. Mover el cómputo a un Web Worker libera el hilo principal y permite mostrar un skeleton/spinner mientras se calcula.

## Scope

- `src/lib/diff/diff.worker.ts` — worker que ejecuta las funciones de diff
- Hook `useDiffWorker(oldText, newText)` que instancia el worker
- Skeleton de carga en `diff-preview/page.tsx` mientras el worker computa
- No incluye: streaming de resultados parciales (reservado para v2.0)

## Approach

Next.js 15+ soporta Web Workers via `new Worker(new URL('./diff.worker.ts', import.meta.url))`. El worker importa las funciones de `compute.ts`, ejecuta el diff completo, y retorna `{ rows, chunks, stats }` via `postMessage`. El hook gestiona el ciclo de vida del worker (create en mount, terminate en cleanup).
