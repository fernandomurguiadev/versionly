# Versionly — Análisis Visual de Referencias
**Skill: visual-reference-analyzer v1.0 · Análisis de 12 imágenes · Febrero 2026**

---

## Inventario de referencias analizadas

| # | Archivo | Screen ID | Confianza |
|---|---|---|---|
| 1 | comparador-versiones.jpg | CMP-01 / CMP-02 | alta |
| 2 | comparador-versiones-2.jpg | CMP-02 (variante) | alta |
| 3 | dashboard.jpg | WS-02 / DOC-01 (grid) | alta |
| 4 | dashboard-listado-docs-1.jpg | DOC-01 (carpeta, grid) | alta |
| 5 | dashboard-listado-docs-2.gif | DOC-01 (carpeta, lista) | alta |
| 6 | edicion-doc.jpg | ED-01 | alta |
| 7 | guardado-version.jpg | ED-02 (modal) | alta |
| 8 | landing-1.png | Landing hero + features | alta |
| 9 | landing-2.png | Landing social proof + pricing | alta |
| 10 | listado-versiones-en-editor.jpg | ED-04 (panel historial) | alta |
| 11 | login.jpg | AUTH-02 | alta |
| 12 | register.png | AUTH-01 | alta |

---

# ANÁLISIS INDIVIDUAL POR PANTALLA

---

## IMG-01 · Comparador de versiones (CMP-01/02) — `comparador-versiones.jpg`

### JSON

```json
{
  "meta": {
    "interface_type": "SaaS app — pantalla de comparación de documentos",
    "purpose": "Mostrar diff side-by-side entre dos versiones de un documento",
    "screen_id": "CMP-01 + CMP-02",
    "confidence": "high",
    "viewport_estimate": "desktop"
  },
  "layout": {
    "pattern": "Split pane — dos columnas simétricas de igual ancho",
    "zones": [
      "Topbar: título + botón 'Cerrar comparación'",
      "Controles: dos dropdowns de versión + botón Comparar + ícono swap",
      "Resumen de cambios: badges de conteo + botones de navegación",
      "Contenido diff: dos paneles con número de línea + texto monoespaciado",
      "Footer leyenda: tres ítems (Añadido, Eliminado, Modificado)"
    ],
    "divider": "Línea vertical azul (~2px) separa visualmente los dos paneles del diff"
  },
  "components": [
    {
      "nombre": "Dropdown versión A",
      "tipo": "select",
      "ubicacion": "Control bar, izquierda",
      "estado": "default",
      "contenido": "v1.3 — (20/3/2024)",
      "ancho": "~50% del control bar",
      "estilo": "Fondo #1E2433, borde sutil, texto blanco, chevron derecho"
    },
    {
      "nombre": "Botón swap",
      "tipo": "icon-button",
      "ubicacion": "Control bar, centro entre los dos dropdowns",
      "estado": "default",
      "icono": "swap/arrows horizontal",
      "estilo": "Solo ícono, sin fondo visible"
    },
    {
      "nombre": "Dropdown versión B",
      "tipo": "select",
      "ubicacion": "Control bar, derecha",
      "estado": "active/focused",
      "contenido": "v1.2 — (15/3/2024)",
      "estilo": "Borde azul activo ~#2563EB o similar"
    },
    {
      "nombre": "Botón Comparar",
      "tipo": "button primary",
      "ubicacion": "Control bar, extremo derecho",
      "estado": "default",
      "texto": "Comparar",
      "estilo": "Fondo azul sólido #2563EB, texto blanco, radius ~6px"
    },
    {
      "nombre": "Cerrar comparación",
      "tipo": "button secondary/ghost",
      "ubicacion": "Topbar, extremo derecho",
      "texto": "✕ Cerrar comparación",
      "estilo": "Fondo oscuro elevado, borde sutil, texto blanco"
    },
    {
      "nombre": "Resumen de cambios",
      "tipo": "status bar con badges",
      "ubicacion": "Entre controles y diff",
      "contenido": "+ 0 añadidos · — 0 eliminados · ✎ 1 modificados",
      "colores": "verde para añadidos, rojo para eliminados, azul para modificados",
      "botones_navegacion": "↑ ↓ flechas + texto 'Cambio 1 de 1'"
    },
    {
      "nombre": "Panel diff versión A",
      "tipo": "code/text panel",
      "ubicacion": "Mitad izquierda del área de contenido",
      "header": "Versión 1.3 · 20/3/2024 / Actualización de procedimientos de seguridad",
      "tipografia": "Monoespaciada, fondo #0D1117 o similar"
    },
    {
      "nombre": "Panel diff versión B",
      "tipo": "code/text panel",
      "ubicacion": "Mitad derecha del área de contenido",
      "header": "Versión 1.2 · 15/3/2024 / Corrección de errores tipográficos"
    },
    {
      "nombre": "Número de línea",
      "tipo": "line number gutter",
      "ubicacion": "Primer columna de cada panel diff",
      "estilo": "Texto secundario, pequeño, sin fondo diferenciado"
    },
    {
      "nombre": "Leyenda footer",
      "tipo": "legend bar",
      "ubicacion": "Bottom de la pantalla",
      "items": [
        { "color": "verde", "label": "Añadido" },
        { "color": "rojo", "label": "Eliminado" },
        { "color": "azul", "label": "Modificado" }
      ]
    }
  ]
}
```

### Notas de implementación — CMP-01/02

- El header del comparador reutiliza el mismo layout de topbar del editor (back arrow + título + subtítulo + botón cerrar)
- El divider azul entre paneles es un `border-left: 2px solid #2563EB` o similar en el panel derecho
- Los números de línea deben estar en un `<span>` fijo a la izquierda, sin seleccionarse con el texto del contenido (`user-select: none`)
- Los badges del resumen (añadido/eliminado/modificado) tienen colores semánticos específicos: verde `~#22C55E`, rojo `~#EF4444`, azul `~#3B82F6`
- La línea de resumen es colapsable (chevron ↑ visible en estado abierto)
- **Estado no visible en la referencia:** highlight de líneas modificadas dentro del panel (resaltado de fondo en color semántico para las líneas específicas que cambiaron). Debe definirse al implementar.

---

## IMG-02 · Comparador variante (CMP-02) — `comparador-versiones-2.jpg`

Misma pantalla que IMG-01, comparando v1.3 con v1.0. Confirma el comportamiento: cuando hay más contenido en versión A que en B, el panel B queda con espacio vacío debajo. **No hay relleno artificial.** Implementar como dos columnas con `overflow-y: auto` independiente cada una.

**Diferencia clave respecto a IMG-01:** versión B (v1.0) tiene solo 2 líneas vs. las 14 de versión A. El panel B no ajusta su altura — ambos paneles tienen la misma altura fija. Confirma: `min-height` común o `height: 100%` en ambos paneles.

---

## IMG-03 · Dashboard — todos los documentos (WS-02) — `dashboard.jpg`

### JSON

```json
{
  "meta": {
    "interface_type": "SaaS app — dashboard principal / listado de documentos",
    "purpose": "Vista global de todos los documentos del workspace",
    "screen_id": "WS-02 + DOC-01 (vista grid)",
    "confidence": "high",
    "viewport_estimate": "desktop"
  },
  "layout": {
    "pattern": "Sidebar fijo izquierdo + contenido principal derecho",
    "sidebar_width": "~270px",
    "grid_main": "3 columnas de cards de igual ancho",
    "gutter_cards": "~24px entre cards",
    "zones": [
      "Sidebar: logo + nav item activo + workspace tree + user footer",
      "Topbar principal: search bar centrada + view toggles + notif + CTA Nuevo",
      "Page header: título H1 + contador de documentos",
      "Grid de cards: 3x2 = 6 documentos visibles"
    ]
  },
  "components": [
    {
      "nombre": "Sidebar navigation",
      "items": [
        "Todos los documentos (ítem activo, bg azul sólido)",
        "ESPACIOS DE TRABAJO (label de sección, uppercase, pequeño)",
        "Empresa Principal + badge Admin (expandido, chevron abajo)",
        "  → Documentación Téc... (carpeta, con ícono folder)",
        "  → Políticas y Procedimi... (carpeta)",
        "  → Marketing y Ventas (carpeta)",
        "Proyecto Beta + badge Editor (colapsado, chevron derecho)"
      ],
      "activo_style": "Fondo azul #2563EB, texto blanco, radius ~8px",
      "inactivo_style": "Texto gris claro, hover implícito",
      "badges_workspace": {
        "Admin": "fondo verde #22C55E o teal, texto blanco, radius full, ~11px text",
        "Editor": "fondo azul más oscuro o slate, texto blanco, radius full"
      },
      "footer": "Avatar circular + Nombre + email truncado + ícono menú (3 puntos)"
    },
    {
      "nombre": "Search bar",
      "tipo": "input search",
      "ubicacion": "Topbar, centro",
      "ancho": "~50% del topbar",
      "placeholder": "Buscar documentos...",
      "estilo": "Fondo oscuro elevado, ícono lupa izquierda, radius ~8px, borde sutil"
    },
    {
      "nombre": "View toggles",
      "tipo": "button group",
      "ubicacion": "Topbar, derecha antes de notificaciones",
      "variantes": ["Grid (activo, ícono cuadrícula)", "Lista (ícono filas)"],
      "estilo_activo": "Fondo ligeramente más claro, sin borde externo"
    },
    {
      "nombre": "Notification bell",
      "tipo": "icon button",
      "ubicacion": "Topbar, antes del CTA",
      "badge": "Punto rojo (unread indicator) en esquina superior derecha del ícono"
    },
    {
      "nombre": "CTA Nuevo",
      "tipo": "button primary",
      "ubicacion": "Topbar, extremo derecho",
      "texto": "+ Nuevo",
      "estilo": "Fondo azul #2563EB, texto blanco, radius ~8px, padding h-16 v-8"
    },
    {
      "nombre": "Document card",
      "tipo": "card",
      "estructura": [
        "Ícono documento (azul sobre fondo azul más oscuro, cuadrado ~48x48, radius ~8px)",
        "Título del documento (semibold, body-lg)",
        "Badge 'Versión actual: vvX.X' (fondo verde, texto blanco, radius full, small)",
        "Divider horizontal sutil",
        "Avatar circular + Nombre autor + fecha relativa (right-aligned)"
      ],
      "fondo_card": "~#161B27 o #1A2035 — ligeramente más claro que el fondo base",
      "borde": "Borde sutil ~1px, color aproximado #2A3347",
      "radius": "~12px",
      "hover": "No visible en screenshot estático — implementar: border color más brillante o bg levemente más claro"
    },
    {
      "nombre": "Badge 'Versión actual'",
      "tipo": "badge",
      "estilo": "Fondo verde #22C55E aprox, texto blanco, radius full (~9999px), font-size ~12px, padding h-8 v-2"
    }
  ]
}
```

---

## IMG-04 · Dashboard carpeta seleccionada — grid (DOC-01) — `dashboard-listado-docs-1.jpg`

Misma estructura que IMG-03 pero con:
- **Sidebar:** ítem "Documentación Téc..." activo con fondo azul (el sidebar activo usa el mismo estilo azul que el ítem de nivel superior en IMG-03)
- **Contenido:** título "Documentación Técnica" + "2 documentos" + grid de 2 cards en una fila
- **Cards vacías:** el área después de los 2 cards está completamente vacía (fondo base, sin grid placeholder)

**Dato clave:** el título de página cambia según la carpeta seleccionada. Implementar como variable del store, no hardcodeado.

---

## IMG-05 · Dashboard carpeta — vista lista (DOC-01 list view) — `dashboard-listado-docs-2.gif`

**Vista alternativa de la misma carpeta**, activada desde el toggle de vista. Layout completamente diferente al grid:

```
Tabla con columnas:
DOCUMENTO | VERSIÓN ACTUAL | ÚLTIMA MODIFICACIÓN | AUTOR | ACCIONES
```

### Componente tabla:

- **Header de tabla:** fondo ligeramente diferenciado `~#1E2433`, texto uppercase XS, color secundario, border-bottom
- **Filas:** fondo base, border-bottom entre filas, hover no visible (implementar: bg ligeramente elevado)
- **Columna DOCUMENTO:** ícono file + nombre en semibold
- **Columna VERSIÓN ACTUAL:** badge verde `vv1.3` — mismo estilo que el badge en card
- **Columna AUTOR:** avatar circular mini (24px aprox) + nombre
- **Columna ACCIONES:** ícono `⋮` (tres puntos vertical) — abre dropdown de acciones
- **Columna ÚLTIMA MODIFICACIÓN:** texto secundario "hace casi 2 años"

**Nota de implementación:** el toggle grid/lista debe persistir en el store del feature. Ambas vistas comparten los mismos datos, solo cambia la presentación.

---

## IMG-06 · Editor de documento (ED-01) — `edicion-doc.jpg`

### JSON

```json
{
  "meta": {
    "interface_type": "SaaS app — editor de texto enriquecido",
    "screen_id": "ED-01",
    "confidence": "high",
    "viewport_estimate": "desktop"
  },
  "layout": {
    "pattern": "Columna única con toolbar + canvas blanco centrado",
    "canvas_max_width": "~760px centrado en el área de contenido",
    "canvas_padding": "~32px de margen interno configurable",
    "zones": [
      "Toolbar: formato, listas, enlaces, imágenes, tablas, tipografía",
      "Canvas de edición: hoja blanca con sombra"
    ]
  },
  "components": [
    {
      "nombre": "Topbar del editor",
      "estructura": {
        "izquierda": "← (back) + ícono documento cuadrado azul + título bold + 'Guardado automáticamente ✓' en verde",
        "derecha": "Badge versión vv1.3 (teal/verde) + Historial (ícono clock) + Compartir (ícono share) + Guardar versión (button primary)"
      }
    },
    {
      "nombre": "Badge versión activa",
      "estilo": "Fondo teal/verde oscuro #0D9488 o #059669, texto blanco, radius full, 'vv1.3'",
      "nota": "Distinto del badge de la card: aquí no dice 'Versión actual:', solo el número"
    },
    {
      "nombre": "Autosave indicator",
      "texto": "Guardado automáticamente ✓",
      "color_check": "Verde ~#22C55E",
      "ubicacion": "Debajo del título, izquierda del topbar",
      "estados_a_implementar": ["Guardado automáticamente ✓", "Guardando...", "Error al guardar ✕"]
    },
    {
      "nombre": "Formatting toolbar",
      "ubicacion": "Encima del canvas",
      "items_visibles": ["B", "I", "U", "|", "alineación", "|", "listas", "enlace", "imagen", "tabla", "|", "fuente", "tamaño", "márgenes", "interlineado", "espaciado de párrafos"],
      "estilo": "Botones compactos, selectores tipo pill, separadores sutiles",
      "nota": "Toolbar prioriza herramientas de fase 2 antes de TipTap"
    },
    {
      "nombre": "Canvas de edición",
      "tipografia": "Sans-serif, body regular, texto oscuro",
      "fondo": "#FFFFFF con sombra suave",
      "padding_interno": "~32px ajustable por control de márgenes",
      "scrollbar": "Sutil, acorde al fondo claro"
    },
    {
      "nombre": "Botón Historial",
      "tipo": "button ghost/secondary",
      "icono": "reloj/clock",
      "texto": "Historial",
      "estilo": "Sin fondo visible, texto gris claro, ícono antes del texto"
    },
    {
      "nombre": "Botón Compartir",
      "tipo": "button ghost/secondary",
      "icono": "share",
      "texto": "Compartir"
    },
    {
      "nombre": "Botón Guardar versión",
      "tipo": "button primary",
      "texto": "Guardar versión",
      "icono": "save/floppy antes del texto",
      "estilo": "Azul sólido #2563EB, texto blanco, radius ~8px"
    }
  ]
}
```

---

## IMG-07 · Modal guardar versión (ED-02) — `guardado-version.jpg`

### JSON — Modal

```json
{
  "meta": {
    "screen_id": "ED-02",
    "tipo": "modal overlay sobre el editor"
  },
  "modal": {
    "ancho": "~500px",
    "fondo": "#1E2433 aproximadamente — elevado respecto al canvas",
    "radius": "~12px",
    "padding": "~32px",
    "overlay_fondo": "Negro semitransparente — el editor de fondo se ve difuminado/oscurecido"
  },
  "estructura": [
    "Título 'Guardar nueva versión' (semibold, ~18px)",
    "Botón ✕ esquina superior derecha",
    "Label 'Nombre de versión *' (asterisco en rojo indica requerido)",
    "Input text: placeholder 'ej: v1.0, v2.1-hotfix'",
    "Label 'Comentario del cambio'",
    "Textarea: placeholder 'Describe los cambios realizados en esta versión...' (~4 líneas de altura)",
    "Checkbox checked 'Marcar como Versión Actual'",
    "Dos botones: Cancelar (secondary) + Guardar (primary azul)"
  ],
  "componentes_clave": [
    {
      "nombre": "Input nombre de versión",
      "estado": "default/empty",
      "fondo": "~#0D1117 o ligeramente más oscuro que el modal",
      "borde": "~1px solid #2A3347",
      "radius": "~8px",
      "placeholder_color": "Gris secundario"
    },
    {
      "nombre": "Textarea comentario",
      "altura": "~100px (~4 líneas)",
      "mismo_estilo_que_input": true,
      "resize": "No visible — probablemente resize: none o resize: vertical"
    },
    {
      "nombre": "Checkbox Marcar como Versión Actual",
      "estado": "checked",
      "color_check": "Azul #2563EB — mismo azul primario",
      "radius_checkbox": "~4px"
    },
    {
      "nombre": "Botón Cancelar",
      "estilo": "Fondo oscuro elevado, borde sutil, texto blanco — misma altura que 'Guardar'",
      "ancho": "~45% del modal"
    },
    {
      "nombre": "Botón Guardar",
      "estilo": "Azul #2563EB, texto blanco, ancho ~45%"
    }
  ]
}
```

---

## IMG-08 + IMG-09 · Landing page — `landing-1.png` + `landing-2.png`

### JSON consolidado

```json
{
  "meta": {
    "interface_type": "Landing page marketing",
    "purpose": "Conversión: registro en la plataforma",
    "confidence": "high",
    "viewport_estimate": "desktop (single column, ~820px max-width contenido)"
  },
  "secciones": [
    {
      "nombre": "Navbar",
      "items": ["Logo Versionly", "Características", "Cómo funciona", "Precios", "Iniciar sesión", "Comenzar gratis (CTA)"],
      "estilo": "Fondo oscuro navbar, links texto gris claro, CTA azul"
    },
    {
      "nombre": "Hero",
      "titulo": "Gestiona versiones de documentos con claridad",
      "titulo_highlight": "'documentos con claridad' en azul #3B82F6",
      "subtitulo": "Versionly te permite crear, comparar y compartir versiones...",
      "ctas": ["Comenzar gratis →", "Ver demo ⊙"],
      "cta_primario_estilo": "Azul sólido #2563EB, radius ~8px",
      "cta_secundario_estilo": "Outline/ghost — borde visible, texto blanco",
      "mockup": "Screenshot embebida de la app con borde de ventana (3 círculos rojo/amarillo/verde estilo macOS)"
    },
    {
      "nombre": "Social proof logos",
      "texto": "Equipos que confían en Versionly",
      "logos": ["TechCorp", "DesignHub", "DevStudio", "ContentLab", "DataFlow"],
      "estilo": "Solo texto, color gris apagado, sin imágenes de logo"
    },
    {
      "nombre": "Features grid",
      "titulo": "Características principales",
      "layout": "4 columnas",
      "cards": [
        { "icono": "branch/git", "color_icono": "azul", "titulo": "Versionado inteligente" },
        { "icono": "columns", "color_icono": "verde/teal", "titulo": "Comparación visual diff" },
        { "icono": "share", "color_icono": "morado", "titulo": "Links dinámicos y fijos" },
        { "icono": "people/roles", "color_icono": "naranja", "titulo": "Roles y notificaciones" }
      ],
      "card_estilo": "Fondo #161B27, radius ~12px, padding ~24px, ícono en cuadrado con fondo de color suave"
    },
    {
      "nombre": "How it works",
      "titulo": "Cómo funciona",
      "layout": "3 pasos lineales con numeración destacada",
      "pasos": [
        { "numero": "1", "color": "azul", "titulo": "Crea tu documento" },
        { "numero": "2", "color": "verde", "titulo": "Guarda versiones" },
        { "numero": "3", "color": "morado", "titulo": "Compara y colabora" }
      ],
      "numero_estilo": "Cuadrado redondeado grande (~56px), fondo del color del paso, número blanco bold"
    },
    {
      "nombre": "Testimonials",
      "layout": "3 columnas",
      "card_estilo": "Fondo #161B27 — mismo que feature cards, radius ~12px",
      "estructura_testimonio": "Stars (5, color dorado) + quote texto + avatar circular colores + nombre + cargo"
    },
    {
      "nombre": "Pricing",
      "titulo": "Planes para cada equipo",
      "layout": "3 columnas: Gratis | Pro (destacado) | Empresa",
      "plan_destacado": {
        "nombre": "Pro",
        "badge": "'Más popular' en badge verde sobre el card",
        "precio": "$19/mes",
        "estilo_card": "Borde azul o fondo levemente diferenciado respecto a los otros dos"
      },
      "plan_gratis": { "precio": "$0/mes", "cta": "Comenzar gratis" },
      "plan_empresa": { "precio": "Custom", "cta": "Contactar ventas" }
    },
    {
      "nombre": "Final CTA",
      "fondo": "Azul sólido — único bloque con color de fondo de acción",
      "titulo": "Comienza a gestionar tus versiones hoy",
      "cta": "Comenzar gratis →"
    },
    {
      "nombre": "Footer",
      "layout": "4 columnas: About | Producto | Recursos | Empresa",
      "fondo": "Oscuro — mismo que navbar",
      "redes": ["Twitter/X", "LinkedIn", "GitHub"],
      "legal": "© 2024 Versionly · Privacidad · Términos · Legal · Powered by Readdy"
    }
  ]
}
```

---

## IMG-10 · Editor con historial abierto (ED-04) — `listado-versiones-en-editor.jpg`

### JSON — Panel historial

```json
{
  "meta": {
    "screen_id": "ED-04",
    "tipo": "Editor con panel lateral derecho abierto"
  },
  "layout": {
    "split": "Editor (70-75% ancho) + Panel historial (25-30% ancho, derecha)",
    "panel_ancho_estimado": "~280-320px"
  },
  "panel_historial": {
    "header": "'Historial de versiones' + botón ✕ para cerrar",
    "items": [
      {
        "version": "v1.3",
        "badge": "Actual",
        "descripcion": "Actualización de procedimientos de seguridad",
        "fecha": "hace casi 2 años",
        "estilo_item": "Fondo verde oscuro/teal, borde o highlight verde, badge 'Actual' en esquina superior derecha del card"
      },
      {
        "version": "v1.2",
        "descripcion": "Corrección de errores tipográficos",
        "fecha": "hace casi 2 años",
        "estilo_item": "Fondo elevado oscuro, sin highlight especial"
      },
      {
        "version": "v1.1",
        "descripcion": "Añadida sección de emergencias",
        "fecha": "hace casi 2 años"
      },
      {
        "version": "v1.0",
        "descripcion": "Versión inicial del manual",
        "fecha": "hace alrededor de 2 años"
      }
    ],
    "footer_panel": "Botón 'Comparar versiones' — ocupa el ancho completo del panel, fondo oscuro elevado, texto blanco"
  },
  "version_item_estilo": {
    "padding": "~16px",
    "radius": "~8px",
    "margin_entre_items": "~8px",
    "version_label": "Semibold, ~14px",
    "descripcion": "Regular, ~13px, color secundario",
    "fecha": "XS, right-aligned, color terciario",
    "activo": "Fondo teal oscuro ~#064E3B o #065F46, borde izquierdo verde brillante ~#22C55E (2-3px)"
  }
}
```

**Nota crítica:** el ítem activo (Versión Actual) tiene un borde izquierdo de acento verde y fondo diferenciado — no solo cambia el color de texto. Implementar con `border-left: 3px solid #22C55E` + `background: #064E3B` (o equivalente Tailwind `border-l-[3px] border-green-500 bg-green-950`).

---

## IMG-11 · Login (AUTH-02) — `login.jpg`

### JSON

```json
{
  "meta": {
    "screen_id": "AUTH-02",
    "tipo": "Página de autenticación",
    "layout": "Centrado vertical y horizontal, fondo con gradiente radial"
  },
  "fondo": {
    "descripcion": "Gradiente radial: centro levemente más brillante (azul oscuro), bordes casi negros",
    "estimado": "radial-gradient(ellipse at center, #0F1A2E 0%, #060B14 70%)"
  },
  "card_formulario": {
    "ancho": "~440px",
    "fondo": "~#111827 o #0F172A — ligeramente visible respecto al fondo",
    "borde": "~1px solid #1E293B",
    "radius": "~16px",
    "padding": "~40px 48px",
    "sombra": "Shadow sutil — elevación mínima"
  },
  "estructura": [
    "Logo circular centrado (~80px) — antes del card",
    "H1 'Bienvenido de nuevo' — bold, ~28-30px",
    "Subtítulo 'Accede a tu espacio de trabajo' — regular, secundario",
    "Label 'Correo electrónico'",
    "Input email: ícono envelope izquierda + placeholder 'tu@email.com'",
    "Label 'Contraseña'",
    "Input password: ícono candado izquierda + asteriscos + ícono ojo derecha (toggle visibilidad)",
    "Fila: checkbox 'Recordarme' + link '¿Olvidaste tu contraseña?' (azul)",
    "Botón primario 'Iniciar sesión' — ancho completo",
    "Link '¿No tienes cuenta? Regístrate' (azul, centrado)",
    "Texto legal: 'Al continuar, aceptas nuestros términos de servicio y política de privacidad'"
  ],
  "input_estilo": {
    "fondo": "~#1E293B",
    "borde": "~1px solid #2A3347",
    "radius": "~8px",
    "altura": "~48px",
    "icono_color": "Gris secundario ~#6B7280",
    "padding_left": "~44px (para el ícono)",
    "padding_right_password": "~44px (para el ojo)"
  }
}
```

---

## IMG-12 · Registro (AUTH-01) — `register.png`

Misma estructura visual que el login. Diferencias:
- Título: "Crear cuenta" (vs "Bienvenido de nuevo")
- Subtítulo: "Comienza a gestionar tus documentos"
- 4 campos: Nombre completo (ícono person) + Email + Contraseña + Confirmar contraseña
- Sin checkbox "Recordarme", sin link "¿Olvidaste?"
- CTA: "Crear cuenta" (ancho completo, mismo estilo azul)
- Links legales con texto azul y underline: "Términos de Servicio" y "Política de Privacidad"
- **Sin el fondo con gradiente radial claramente diferenciado** — fondo parece más uniforme/plano

**Nota:** el campo "Confirmar contraseña" tiene placeholder "Repite tu contraseña" — distinto al de contraseña "Mínimo 6 caracteres". Implementar ambos placeholders exactos.

---

# SÍNTESIS CROSS-REFERENCE — DESIGN SYSTEM CONSOLIDADO

## Tokens confirmados en todas las pantallas

```json
{
  "design_system": {
    "nombre": "Versionly Dark Theme",
    "modo": "dark-only (no se observa modo claro en ninguna referencia)",
    "confidence": "high"
  },
  "colors": {
    "background": {
      "base":     "#080D17 → #0A0F1A",
      "elevated": "#161B27 → #1A2035",
      "overlay":  "#1E2433 → #202738",
      "sidebar":  "#0E1320 → #111827",
      "modal":    "#1E2433",
      "canvas":   "#060B14 → #080D17"
    },
    "text": {
      "primary":   "#FFFFFF o #F1F5F9",
      "secondary": "#94A3B8 → #9CA3AF",
      "tertiary":  "#64748B → #6B7280",
      "disabled":  "#374151 → #4B5563"
    },
    "action": {
      "primary":        "#2563EB",
      "primary_hover":  "#1D4ED8",
      "primary_text":   "#FFFFFF"
    },
    "semantic": {
      "success":      "#22C55E",
      "success_bg":   "#064E3B → #065F46",
      "version_badge": "#059669 → #0D9488",
      "error":        "#EF4444",
      "warning":      "#F59E0B",
      "modified":     "#3B82F6",
      "added":        "#22C55E",
      "removed":      "#EF4444"
    },
    "border": {
      "subtle":   "#1E2433 → #2A3347",
      "default":  "#2A3347 → #374151",
      "strong":   "#3B4255",
      "active":   "#2563EB"
    }
  },
  "typography": {
    "font_family": "Sans-serif geométrico — posiblemente Inter, Geist o DM Sans (no determinable con certeza desde screenshots)",
    "font_mono":   "Monoespaciada — usada en el comparador. Posiblemente JetBrains Mono, Fira Code o similar",
    "scale": {
      "display":  { "size": "~36-42px", "weight": "800/bold" },
      "h1":       { "size": "~24-28px", "weight": "700/bold" },
      "h2":       { "size": "~18-20px", "weight": "600/semibold" },
      "h3":       { "size": "~15-16px", "weight": "600/semibold" },
      "body-lg":  { "size": "~15-16px", "weight": "400/regular" },
      "body":     { "size": "~13-14px", "weight": "400/regular" },
      "sm":       { "size": "~12px",    "weight": "400/regular" },
      "xs":       { "size": "~11px",    "weight": "400/regular" },
      "label":    { "size": "~13px",    "weight": "500/medium" },
      "badge":    { "size": "~11-12px", "weight": "500/medium" },
      "overline": { "size": "~10-11px", "weight": "600/semibold", "transform": "uppercase", "tracking": "wide" }
    }
  },
  "spacing": {
    "base_unit": "8px",
    "scale": ["4px", "8px", "12px", "16px", "20px", "24px", "32px", "40px", "48px", "64px"]
  },
  "border_radius": {
    "none":  "0",
    "xs":    "4px — checkboxes",
    "sm":    "6-8px — inputs, botones, items de lista",
    "md":    "8-10px — cards pequeñas, modales internos",
    "lg":    "12-16px — cards principales, modal",
    "full":  "9999px — badges, avatares"
  },
  "shadows": {
    "none":    "fondos planos (mayoría de elementos)",
    "modal":   "box-shadow: 0 20px 60px rgba(0,0,0,0.5) — modales sobre el contenido",
    "card":    "shadow muy sutil, casi indetectable — el contraste se logra por color de fondo, no sombra"
  },
  "iconography": {
    "style":  "Outline/stroke — consistente en toda la app",
    "size":   "16-20px en toolbar, 20-24px en topbar y navegación",
    "library": "Lucide o Heroicons (ambos son outline y el estilo es compatible)"
  }
}
```

---

# → IMPLEMENTATION NOTES para Versionly (Next.js 15 App Router + Tailwind)

## Design Token Setup — `tailwind.config.ts`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          'canvas':   '#080D17',
          'base':     '#0D1117',
          'elevated': '#161B27',
          'overlay':  '#1E2433',
          'sidebar':  '#111827',
          'modal':    '#1E2433',
        },
        text: {
          'primary':   '#F1F5F9',
          'secondary': '#94A3B8',
          'tertiary':  '#64748B',
          'disabled':  '#4B5563',
          'inverse':   '#FFFFFF',
        },
        action: {
          'primary':   '#2563EB',
          'primary-h': '#1D4ED8',
          'ghost':     'transparent',
        },
        border: {
          'subtle':  '#1E2433',
          'default': '#2A3347',
          'strong':  '#374151',
          'active':  '#2563EB',
        },
        version: {
          'badge-bg':   '#059669',
          'badge-text': '#FFFFFF',
          'current-bg': '#064E3B',
          'current-border': '#22C55E',
        },
        diff: {
          'added':    '#22C55E',
          'removed':  '#EF4444',
          'modified': '#3B82F6',
          'added-bg':    'rgba(34,197,94,0.12)',
          'removed-bg':  'rgba(239,68,68,0.12)',
          'modified-bg': 'rgba(59,130,246,0.12)',
        },
        workspace: {
          'admin-badge':  '#059669',
          'editor-badge': '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['38px', { lineHeight: '1.1', fontWeight: '800' }],
        'h1':      ['26px', { lineHeight: '1.3', fontWeight: '700' }],
        'h2':      ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3':      ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['15px', { lineHeight: '1.6' }],
        'body':    ['14px', { lineHeight: '1.6' }],
        'sm':      ['13px', { lineHeight: '1.5' }],
        'xs':      ['12px', { lineHeight: '1.4' }],
        'label':   ['13px', { lineHeight: '1', fontWeight: '500' }],
        'badge':   ['11px', { lineHeight: '1', fontWeight: '500' }],
        'overline':['11px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'modal': '0 20px 60px rgba(0,0,0,0.5)',
        'card':  '0 1px 3px rgba(0,0,0,0.3)',
      }
    }
  },
  plugins: []
}
```

---

## Component Priority List (orden de implementación)

> Los componentes usan nomenclatura de archivos Next.js/React (kebab-case). Los primitivos de shadcn/ui (`Button`, `Input`, `Dialog`, etc.) se instalan desde la CLI de shadcn y se extienden con los tokens del design system.

### Fase 1 — Shared primitivos (sin estos nada funciona)

1. **`version-badge`** — variantes: version (teal), current (verde), admin (teal), editor (azul), diff-added/removed/modified, plan (Más popular)
2. **`Button` (shadcn extendido)** — variantes: primary (azul), secondary (ghost con borde), ghost (sin borde), destructive (rojo), icon-only. Estados: default, hover, loading, disabled
3. **`Input` / `Textarea` (shadcn extendido)** — texto, email, password (con toggle ojo). Con ícono izquierdo opcional
4. **`Dialog` (shadcn extendido)** — container con overlay, título, X, slot de contenido, slot de footer
5. **`avatar`** — circular, tamaños: sm (24px), md (32px), lg (40px), xl (80px)
6. **`Checkbox` (shadcn extendido)** — con label. Estado checked azul

### Fase 2 — Layout y navegación

7. **`sidebar`** — con logo, nav-item (activo/inactivo), workspace-tree (expandible), user-footer. Client Component.
8. **`topbar`** — variantes: app principal, editor, comparador
9. **`search-bar`** — con ícono lupa, placeholder, debounce

### Fase 3 — Pantallas de auth

10. **`app/(auth)/login/page.tsx`** (AUTH-02)
11. **`app/(auth)/register/page.tsx`** (AUTH-01)

### Fase 4 — Dashboard y documentos

12. **`document-card`** (vista grid)
13. **`document-row`** (vista tabla — DOC-01 list)
14. **`view-toggle`** (grid/lista)

### Fase 5 — Editor

15. **`tiptap-editor`** con `formatting-toolbar` (Client Component)
16. **`autosave-indicator`** — tres estados
17. **`save-version-modal`** (ED-02)
18. **`version-history-panel`** (ED-04)
19. **`version-history-item`**

### Fase 6 — Comparador

20. **`version-selector`** (CMP-01)
21. **`diff-summary-bar`** con badges añadido/eliminado/modificado
22. **`diff-panel`** — con line numbers, contenido monoespaciado, resaltado semántico
23. **`diff-legend`** — footer leyenda

### Fase 7 — Google Drive *(v1.1)*

24. **`drive-file-picker`** — modal IMP-GD-03. Client Component con `useQuery` (TanStack Query).
25. **`drive-file-list`** — listado paginado con búsqueda. Recibe datos de `use-drive-files.ts`.
26. **`drive-file-list-item`** — ítem individual con ícono de tipo, nombre, fecha y badge mimeType.
27. **`connected-account`** — card de cuenta Google conectada con badge estado y botón Revocar.
28. **`app/(app)/(features)/integrations/google-drive/callback/page.tsx`** — Server Component para el callback OAuth.

---

## APP SHELL — Layout aplicado

```json
{
  "shell": {
    "topbar": {
      "height": 56,
      "elements": ["Logo Versionly", "Workspace selector", "Búsqueda", "Atajos a secciones"]
    },
    "layout": "Sidebar izquierda fija + Contenido + Inspector derecho",
    "sidebar": {
      "width": 240,
      "collapsible_to": 72,
      "sections": ["Inicio", "Proyectos", "Recientes", "Favoritos", "Notificaciones"],
      "primary_cta": "Nuevo (Proyecto, Carpeta, Documento, Importar)"
    },
    "inspector": {
      "width": 360,
      "modes": ["Historial", "Metadata", "Comparar"],
      "behavior": "deslizable, colapsable, no invasivo"
    }
  },
  "explorer": {
    "header": ["Breadcrumb dinámico", "Acciones: Compartir, Crear, Filtro, Vista"],
    "table_columns": ["Nombre", "Tipo", "Última modificación", "Autor", "Versión actual", "Acciones"],
    "interactions": ["Filtrado tiempo real", "Ordenamiento", "Acciones en hover"]
  },
  "document_view": {
    "header": ["Nombre editable", "Badge de estado", "Guardar versión", "Historial", "Comparar", "Compartir"],
    "canvas": ["Documento blanco", "Max 880–960px", "Centrado", "Sombra sutil", "Toolbar minimal flotante"]
  }
}
```

> Implementado en Next.js: ver App Shell y Sidebar en `app/(app)/layout.tsx` y `components/layout/app-shell.tsx`.

## Next.js 15 App Router — Implementation Notes

- **Routing:** la sidebar activa el ítem correcto usando `usePathname()` de `next/navigation` comparado con el href de cada nav-item.
- **View toggle (grid/lista):** persistir en un Zustand store o en `useSearchParams` para que sea compartible por URL. Ambas vistas en el mismo componente con condicional `viewMode === 'grid'`.
- **Sidebar tree:** componente Client (`"use client"`) con estado local de expansión por workspace. Renderizado recursivo de carpetas.
- **Editor topbar:** el badge de versión activa (`vv1.3`) se lee del store de editor (TanStack Query + estado optimista). Invalida automáticamente al marcar nueva versión actual.
- **Autosave indicator:** `useState<'idle'|'saving'|'saved'|'error'>` en el componente de editor. La clase Tailwind cambia según el valor.
- **Panel historial:** slide-in con Tailwind `translate-x` + `transition-transform`. El ancho del editor disminuye con CSS Grid cuando el panel está abierto.
- **Comparador:** ambos paneles de diff con `overflow-y: auto` **independientes** y misma altura. Scroll sincronizado es un nice-to-have post-MVP.
- **Font family:** usar `next/font/google` con `Inter` (optimización automática de fuentes, sin petición a Google en cliente).
- **Drive File Picker *(v1.1)*:** componente Client. Los datos se obtienen con `useQuery` de TanStack Query llamando al backend (que a su vez llama a Google Drive API). El modal se monta sobre la página de Importaciones con un portal de shadcn/ui `Dialog`.
- **OAuth Callback *(v1.1)*:** `app/(app)/(features)/integrations/google-drive/callback/page.tsx` es un Server Component que lee el `code` del `searchParams`, llama al backend para el intercambio de token via `fetch` server-side, y luego redirige con `redirect()` de `next/navigation`. No expone el código de autorización al cliente.

---

## Estados críticos a implementar (no visibles en referencias)

| Componente | Estados faltantes que deben diseñarse |
|---|---|
| `document-card` | Hover (borde activo), Loading skeleton, Sin versión actual |
| `app-button` | Hover, Focus ring, Disabled (opacity-50), Loading (spinner) |
| `app-input` | Focus (borde azul activo), Error (borde rojo + mensaje), Disabled |
| `version-history-item` | Hover, Cargando versión |
| `sidebar nav-item` | Hover, Focus |
| `diff-panel` | Líneas con highlight (no visible en referencia — cómo se ve una línea modificada dentro del panel) |
| `app-modal` | Opening/closing animation |
| `login/register` | Error de validación en campos, Estado loading del botón submit |
| `notification-bell` | Panel abierto con lista, Empty state |

---

---

# ESPECIFICACIONES DE COMPONENTES — Google Drive *(v1.1)*

---

## Drive File Picker Modal — IMP-GD-03

Modal de selección de archivos de Google Drive. Se abre desde el tab "Desde Google Drive" en la pantalla de Importaciones.

```json
{
  "id": "IMP-GD-03",
  "version": "v1.1",
  "tipo": "modal medium",
  "dimensiones": {
    "ancho": "600px",
    "alto": "auto — máximo 80vh con scroll interno en la lista"
  },
  "estructura": [
    "Header: ícono Google Drive (color oficial) + título 'Importar desde Google Drive' + botón ✕",
    "Search bar: input con placeholder 'Buscar archivos...' + ícono lupa izquierda",
    "File list: lista scrolleable de archivos (ver especificación de ítem)",
    "Paginación: botón 'Cargar más' al final de la lista — visible solo si hay más resultados",
    "Footer: botón 'Cancelar' (secondary) + botón 'Importar seleccionado' (primary)"
  ],
  "header": {
    "icono_drive": "SVG oficial de Google Drive — 24px",
    "titulo": "Importar desde Google Drive",
    "peso_titulo": "semibold ~18px",
    "boton_cerrar": "ícono ✕ esquina superior derecha — ghost, 32px"
  },
  "search_bar": {
    "placeholder": "Buscar archivos...",
    "icono": "lupa, izquierda, color text-secondary",
    "fondo": "bg-elevated",
    "borde": "border-default",
    "radius": "md (8px)",
    "debounce": "300ms antes de disparar la búsqueda"
  },
  "file_list_item": {
    "estructura": [
      "Ícono tipo de archivo (16x16): .docx → ícono Word azul, Google Doc → ícono Docs multicolor",
      "Nombre del archivo (semibold, truncado con ellipsis si supera el ancho)",
      "Fecha de modificación (text-secondary, right-aligned)",
      "Badge mimeType (xs, outline): 'DOCX' o 'Google Doc'"
    ],
    "fondo_default": "transparent",
    "fondo_hover": "bg-elevated",
    "fondo_seleccionado": "bg-overlay + borde izquierdo 3px action-primary",
    "padding": "12px 16px",
    "radius": "sm (6px)",
    "cursor": "pointer"
  },
  "paginacion": {
    "tipo": "botón 'Cargar más' centrado al final de la lista",
    "estilo": "secondary, ancho auto",
    "visibilidad": "solo si el backend indica que hay más resultados (hasNextPage)"
  },
  "footer": {
    "layout": "dos botones alineados a la derecha",
    "boton_cancelar": {
      "texto": "Cancelar",
      "variante": "secondary",
      "accion": "cierra el modal sin importar"
    },
    "boton_importar": {
      "texto": "Importar seleccionado",
      "variante": "primary (azul #2563EB)",
      "estado_disabled": "cuando no hay ningún archivo seleccionado",
      "estado_loading": "spinner inline mientras se procesa"
    }
  },
  "estado_loading": {
    "tipo": "skeleton rows",
    "cantidad_skeletons": 6,
    "estructura_skeleton": "línea corta (ícono) + línea larga (nombre) + línea corta (fecha)"
  },
  "estado_error": {
    "tipo": "inline — reemplaza la lista",
    "contenido": "ícono de alerta + mensaje de error + botón 'Reintentar'",
    "estilo_mensaje": "text-secondary, centrado"
  },
  "estado_empty": {
    "icono": "ícono Drive atenuado ~40px",
    "texto": "No hay archivos .docx ni Google Docs en tu Drive",
    "sub_texto": "Solo se muestran archivos .docx y Google Docs",
    "cta": null
  }
}
```

**Notas de implementación:**

- El modal usa el token `bg-modal` (#1E2433) como fondo — mismo que ED-02.
- La selección es de un solo archivo (single-select). Seleccionar un ítem deselecciona el anterior.
- El listado filtra por mimeType: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`) y `application/vnd.google-apps.document` (Google Doc).
- La búsqueda filtra sobre los resultados ya paginados localmente, y también puede disparar una nueva llamada al backend si se agota la lista local.
- El estado de selección vive en `use-drive-files.ts` (TanStack Query + estado local).

---

## Connected Accounts Panel — SET-GD-01 *(v1.1)*

Página bajo Settings del workspace que lista las cuentas de Google conectadas.

```json
{
  "id": "SET-GD-01",
  "version": "v1.1",
  "tipo": "página — sección de settings",
  "layout": "lista vertical de account cards + CTA para conectar nueva cuenta"
}
```

### Account Card

| Elemento | Especificación |
|---|---|
| Avatar Google | Imagen de perfil de Google (32px circular) o inicial del email si no hay foto |
| Email | Texto semibold, truncado con ellipsis |
| Badge estado | "Conectado" (verde, bg-success-bg) o "Expirado" (naranja/warning) |
| Botón "Revocar" | Variante destructive (ghost con borde rojo sutil) — solo Admin |
| Fondo card | bg-elevated (~#161B27), borde border-default, radius lg (12px), padding 16px |

### Empty State

```json
{
  "icono": "ícono Google Drive — 48px, color text-tertiary",
  "titulo": "Conecta tu Google Drive para importar documentos",
  "descripcion": "Al conectar tu cuenta de Google, podrás seleccionar archivos .docx y Google Docs directamente desde tu Drive.",
  "cta": {
    "texto": "Conectar Google Drive",
    "variante": "primary",
    "accion": "inicia flujo IMP-GD-01 (redirect OAuth2)"
  }
}
```

### Diálogo de confirmación al revocar

| Campo | Valor |
|---|---|
| Tipo | Modal de confirmación — ancho ~440px |
| Título | "¿Revocar acceso a Google Drive?" |
| Cuerpo | "Los documentos ya importados no se verán afectados. Podrás volver a conectar tu cuenta en cualquier momento." |
| Botón cancelar | "Cancelar" (secondary) |
| Botón confirmar | "Revocar acceso" (destructive — fondo rojo #EF4444, texto blanco) |

**Notas de implementación:**

- La lista de cuentas conectadas se obtiene con `use-drive-connection.ts` (TanStack Query).
- Revocar dispara `DELETE /api/integrations/google-drive/connections/:id` y luego invalida la query.
- Si el token de una cuenta está expirado (backend detecta 401 al llamar a Drive API), el badge cambia a "Expirado" y aparece un botón "Reconectar" en lugar de "Revocar".
- Solo el rol Admin ve esta página (`SET-GD-01`). Los Editores pueden iniciar el flujo de importación pero no administrar las conexiones del workspace.

---

## Inconsistencias detectadas entre referencias

| Inconsistencia | Pantallas involucradas | Decisión sugerida |
|---|---|---|
| Badge "Versión actual" en cards dice `vv1.3` (doble v) pero el topbar del editor dice `vv1.3` también — parece intencional | IMG-03, IMG-06 | Mantener `vv` en badges de versión, pero verificar si es convención o error tipográfico |
| El badge de workspace "Admin" parece verde en IMG-03 pero no se puede confirmar HEX con precisión | IMG-03 | Usar `#059669` (green-600) como valor base |
| La landing (IMG-08) tiene fondo completamente negro `#000000` mientras la app usa `#080D17`. | IMG-08 vs resto | Mantener separación: la landing puede usar negro puro para impacto visual, la app usa el azul muy oscuro |
| El card del plan "Pro" en pricing tiene borde azul mientras los otros no tienen borde diferenciado | IMG-09 | Implementar como variante de card: `variant="featured"` con `border-action-primary` |

---

## Replication Fidelity Notes

**Replicar exactamente:**
- Colores de fondo por jerarquía (canvas < base < elevated < overlay < modal)
- El badge de versión actual con fondo verde/teal
- Los tres colores semánticos del diff (verde/rojo/azul) — críticos para la función del producto
- El borde izquierdo verde del ítem activo en el historial de versiones
- El gradiente radial del fondo de login/register
- El checkbox checked azul en el modal de guardar versión

**Puede adaptarse:**
- Las fuentes exactas (Inter es un buen equivalente de lo observado)
- El fondo del canvas del editor (se puede usar `bg-bg-canvas` con el token definido)
- El estilo del scrollbar (no crítico para MVP)
- Los animaciones de transición (no visibles en screenshots estáticos — definir a criterio)
- La decoración del mockup de app en el hero de la landing (los tres círculos macOS-style)
