# Tasks: app-diff-virtual-scroll

## 1. Instalación

- [x] 1.1 `npm install @tanstack/react-virtual` en `app/`

## 2. Reemplazar tabla por divs

- [x] 2.1 Eliminar `<table>` y `<colgroup>` de `SplitView`
- [x] 2.2 Implementar layout flex de 4 columnas con divs
- [x] 2.3 Mantener apariencia visual idéntica (borders, números de línea, colores)

## 3. Integrar virtualizer

- [x] 3.1 `useVirtualizer` con `count`, `getScrollElement`, `estimateSize: () => 28`
- [x] 3.2 `overscan: 15` para evitar flicker al scroll rápido
- [x] 3.3 `ref={virtualizer.measureElement}` en cada fila para medición real
- [x] 3.4 Contenedor outer con `height: virtualizer.getTotalSize()` y `position: relative`

## 4. Verificación

- [x] 4.1 `npm run typecheck` sin errores
- [x] 4.2 Scroll fluido en `/diff-preview`
- [x] 4.3 Filas colapsadas ("Expandir") renderizan correctamente en el virtualizer
