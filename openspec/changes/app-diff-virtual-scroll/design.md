# Design: app-diff-virtual-scroll

## Por qué no `<table>`

`<table>` requiere que el browser conozca la altura de todas las filas para calcular el tamaño del scrollbar. Con virtual scroll, las filas no existen en el DOM hasta que son visibles — incompatible con la semántica de tabla. Se reemplaza por un contenedor `<div>` con CSS que replica el layout de 4 columnas.

## Layout de 4 columnas sin tabla

```
flex row
  ├── [38px]  num-left   (border-r)
  ├── [50%]   content-left (border-r)  ← flex-1
  ├── [38px]  num-right  (border-r)
  └── [50%]   content-right           ← flex-1
```

Cada "fila" es un `<div className="flex">` con estos 4 hijos. Al ser divs, el virtualizer puede posicionarlos con `position: absolute`.

## Configuración del virtualizer

```typescript
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 28,   // altura estimada en px
  overscan: 15,              // filas extra renderizadas fuera de viewport
});
```

`measureElement` en cada fila permite al virtualizer corregir la altura real si difiere del estimado (líneas largas con wrap, filas colapsadas que son más altas).

## Contenedor scroll

```tsx
<div ref={scrollRef} className="h-full overflow-auto">
  <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
    {virtualizer.getVirtualItems().map(vItem => (
      <div style={{ position: 'absolute', top: vItem.start, left: 0, right: 0 }} ...>
        {renderItem(items[vItem.index])}
      </div>
    ))}
  </div>
</div>
```
