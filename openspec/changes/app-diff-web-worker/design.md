# Design: app-diff-web-worker

## Worker file

```typescript
// src/lib/diff/diff.worker.ts
import { computeAlignedLineDiff, computeDiff, diffStats } from './compute';

self.onmessage = (e: MessageEvent<{ oldText: string; newText: string }>) => {
  const { oldText, newText } = e.data;
  const rows   = computeAlignedLineDiff(oldText, newText);
  const chunks = computeDiff(oldText, newText);
  const stats  = diffStats(chunks);
  self.postMessage({ rows, chunks, stats });
};
```

## Hook `useDiffWorker`

```typescript
function useDiffWorker(oldText: string, newText: string) {
  const [state, setState] = useState<DiffState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const worker = new Worker(new URL('../lib/diff/diff.worker.ts', import.meta.url));
    worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
      setState(e.data);
      setLoading(false);
    };
    worker.postMessage({ oldText, newText });
    return () => worker.terminate();
  }, [oldText, newText]);

  return { ...state, loading };
}
```

## Skeleton

Mientras `loading === true`, se renderizan 20 filas de placeholder con `animate-pulse`.
Las filas skeleton imitan el layout de 4 columnas del diff real para evitar layout shift al cargar.

## TypeScript config

El worker usa `self.onmessage` del lib `WebWorker`. Si TypeScript falla, agregar `"lib": ["dom", "dom.iterable", "webworker"]` en un `tsconfig.worker.json` separado y compilar el worker con él. Alternativamente, declarar `self` como `DedicatedWorkerGlobalScope`.
