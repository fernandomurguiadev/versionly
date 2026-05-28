# Tasks: app-diff-web-worker

## 1. Worker file

- [x] 1.1 Crear `src/lib/diff/diff.worker.ts` con `self.onmessage` handler
- [ ] 1.2 Verificar que TypeScript compila el worker sin errores (ajustar tsconfig si necesario)

## 2. Hook useDiffWorker

- [ ] 2.1 Crear `src/lib/hooks/use-diff-worker.ts`
- [ ] 2.2 Instanciar worker con `new Worker(new URL(...))`
- [ ] 2.3 Manejar `onmessage` y actualizar state
- [ ] 2.4 `worker.terminate()` en cleanup del `useEffect`

## 3. Integración en page

- [ ] 3.1 Reemplazar `setTimeout` actual por `useDiffWorker` en `diff-preview/page.tsx`
- [ ] 3.2 Mostrar skeleton mientras `loading === true`
- [ ] 3.3 Verificar que la UI no se bloquea durante el cómputo (test con texto largo)

## 4. Verificación

- [ ] 4.1 `npm run typecheck` sin errores
- [ ] 4.2 Skeleton visible en la carga inicial
- [ ] 4.3 UI responde a interacciones durante el cómputo del diff
