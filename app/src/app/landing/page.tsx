import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ─── Icons inline (sin dependencias extra) ───────────────────────────────────

function IconLayers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconDiff() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconImport() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <IconLayers />,
    title: 'Versionado intencional',
    description:
      'Cada versión que guardás tiene un propósito. Añadí un mensaje descriptivo y creá un historial limpio que cualquiera pueda entender.',
    color: 'text-violet-500 dark:text-violet-400',
    bg: 'bg-violet-500/10 dark:bg-violet-400/10',
  },
  {
    icon: <IconDiff />,
    title: 'Diff visual lado a lado',
    description:
      'Compará cualquier par de versiones al instante. Líneas añadidas en verde, eliminadas en rojo — sin ambigüedades.',
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-500/10 dark:bg-sky-400/10',
  },
  {
    icon: <IconShare />,
    title: 'Links de compartición',
    description:
      'Compartí una versión específica con un link inmutable. El destinatario ve exactamente lo que vos querés — nada más, nada menos.',
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  },
  {
    icon: <IconImport />,
    title: 'Importación desde Drive',
    description:
      'Traé tus documentos de Google Drive con un click. Seguí trabajando donde estabas sin perder el historial.',
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
  },
];

const comparison = [
  {
    feature: 'Versiones con mensaje descriptivo',
    versionly: true,
    gdocs: false,
  },
  {
    feature: 'Diff visual entre versiones',
    versionly: true,
    gdocs: false,
  },
  {
    feature: 'Links de versión inmutables',
    versionly: true,
    gdocs: false,
  },
  {
    feature: 'Control total del historial',
    versionly: true,
    gdocs: false,
  },
  {
    feature: 'Organización en workspaces',
    versionly: true,
    gdocs: false,
  },
];

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">V</span>
            <span>Versionly</span>
          </Link>

          {/* Nav links — ocultos en mobile */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="transition-colors hover:text-foreground">Producto</Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">Precios</Link>
            <Link href="#docs" className="transition-colors hover:text-foreground">Docs</Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:translate-y-px"
            >
              Empezar gratis
            </Link>
          </div>

        </div>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-6 sm:pt-32 sm:pb-28">

          {/* Gradiente de fondo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary) / 0.12) 0%, transparent 70%)',
            }}
          />

          <div className="mx-auto max-w-4xl text-center">

            <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v1.0 MVP — Ya disponible
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.08]">
              Versioning{' '}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                with intention
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Guardá cada versión de tus documentos con un propósito claro. Compará cambios,
              compartí links inmutables y tomá el control total de tu historial.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:translate-y-px"
              >
                Empezar gratis
              </Link>
              <Link
                href="/editor-preview"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-8 py-3.5 text-base font-semibold transition-all hover:bg-muted active:translate-y-px"
              >
                Ver demo
                <IconArrowRight />
              </Link>
            </div>

            {/* Stat pills */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {['Sin tarjeta de crédito', 'Setup en 30 segundos', 'Gratis para siempre en el plan básico'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="text-emerald-500">
                    <IconCheck />
                  </span>
                  {item}
                </span>
              ))}
            </div>

          </div>
        </section>

        {/* ── Demo visual ── */}
        <section className="px-4 py-16 sm:px-6 sm:py-24" id="demo">
          <div className="mx-auto max-w-5xl">

            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">

              {/* Barra de título del "editor" */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-4 text-xs text-muted-foreground font-mono">versionly.app / editor</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">

                {/* Editor principal */}
                <div className="border-b lg:border-b-0 lg:border-r border-border p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Propuesta comercial Q2 2025</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Guardado hace 2 minutos · Versión 4</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Guardado
                    </span>
                  </div>

                  {/* Contenido simulado del editor */}
                  <div className="space-y-2.5 font-mono text-sm">
                    <div className="h-5 w-3/4 rounded bg-foreground/10" />
                    <div className="h-5 w-full rounded bg-foreground/8" />
                    <div className="h-5 w-5/6 rounded bg-foreground/8" />
                    <div className="h-5 w-2/3 rounded bg-foreground/6" />
                    <div className="h-4" />
                    {/* Línea añadida (diff) */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-500 select-none w-4">+</span>
                      <div className="h-5 flex-1 rounded bg-emerald-500/20" />
                    </div>
                    {/* Línea eliminada (diff) */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-500 select-none w-4">−</span>
                      <div className="h-5 flex-1 rounded bg-red-500/20" />
                    </div>
                    <div className="h-5 w-full rounded bg-foreground/8" />
                    <div className="h-5 w-4/5 rounded bg-foreground/6" />
                    <div className="h-4" />
                    <div className="h-5 w-full rounded bg-foreground/8" />
                    <div className="h-5 w-3/5 rounded bg-foreground/6" />
                  </div>
                </div>

                {/* Panel de versiones */}
                <div className="p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Historial</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Versión final revisada', time: 'Hace 2 min', active: true },
                      { label: 'Ajuste de pricing', time: 'Ayer 18:30', active: false },
                      { label: 'Primera propuesta', time: 'Lun 10:00', active: false },
                      { label: 'Borrador inicial', time: 'Dom 20:15', active: false },
                    ].map((v) => (
                      <div
                        key={v.label}
                        className={[
                          'rounded-lg border px-3 py-2.5 transition-colors cursor-default',
                          v.active
                            ? 'border-primary/40 bg-primary/5 text-foreground'
                            : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60',
                        ].join(' ')}
                      >
                        <p className="text-xs font-medium leading-snug">{v.label}</p>
                        <p className="text-[11px] mt-0.5 opacity-60">{v.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-4 py-16 sm:px-6 sm:py-24" id="features">
          <div className="mx-auto max-w-6xl">

            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4">Producto</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Todo lo que necesitás para gestionar versiones
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                Construido para equipos que valoran la claridad y la trazabilidad en sus documentos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feat) => (
                <div
                  key={feat.title}
                  className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
                >
                  <div className={['inline-flex h-11 w-11 items-center justify-center rounded-xl', feat.bg, feat.color].join(' ')}>
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground leading-snug">{feat.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── Social proof / Comparación ── */}
        <section className="px-4 py-16 sm:px-6 sm:py-24 bg-muted/30">
          <div className="mx-auto max-w-4xl">

            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4">¿Por qué Versionly?</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Google Docs no fue diseñado para esto
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                El historial de versiones de Docs es opaco y difícil de navegar.
                Versionly pone el control en tus manos.
              </p>
            </div>

            {/* Tabla comparativa */}
            <div className="overflow-hidden rounded-2xl border border-border">
              {/* Encabezado */}
              <div className="grid grid-cols-[1fr_140px_140px] border-b border-border bg-muted/50 px-6 py-4 text-sm font-semibold">
                <span className="text-muted-foreground">Característica</span>
                <span className="text-center text-foreground">Versionly</span>
                <span className="text-center text-muted-foreground">Google Docs</span>
              </div>

              {/* Filas */}
              {comparison.map((row, i) => (
                <div
                  key={row.feature}
                  className={[
                    'grid grid-cols-[1fr_140px_140px] items-center px-6 py-4 text-sm',
                    i < comparison.length - 1 ? 'border-b border-border/60' : '',
                    i % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                  ].join(' ')}
                >
                  <span className="text-foreground">{row.feature}</span>
                  <span className="flex justify-center text-emerald-500">
                    {row.versionly ? <IconCheck /> : <span className="text-red-400"><IconX /></span>}
                  </span>
                  <span className="flex justify-center text-red-400">
                    {row.gdocs ? <IconCheck /> : <IconX />}
                  </span>
                </div>
              ))}
            </div>

            {/* 3 puntos de diferenciación */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  number: '01',
                  title: 'Intención explícita',
                  body: 'Cada versión tiene un mensaje que explica el "por qué" del cambio, no solo el "qué".',
                },
                {
                  number: '02',
                  title: 'Inmutabilidad garantizada',
                  body: 'Una vez guardada, una versión no puede modificarse. Lo que compartís, persiste.',
                },
                {
                  number: '03',
                  title: 'Colaboración sin ruido',
                  body: 'Compartís exactamente la versión que querés. Sin ediciones accidentales, sin sorpresas.',
                },
              ].map((point) => (
                <div key={point.number} className="flex flex-col gap-2 p-5 rounded-xl border border-border bg-card">
                  <span className="text-3xl font-black text-primary/30 font-mono leading-none">{point.number}</span>
                  <h3 className="font-semibold text-foreground">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{point.body}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">

          {/* Gradiente de fondo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
            }}
          />

          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Empezar gratis hoy
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              Sin límites de versiones en el plan gratuito. Sin tarjeta de crédito. Sin compromisos.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:translate-y-px"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/editor-preview"
                className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Ver demo primero
                <IconArrowRight />
              </Link>
            </div>
          </div>

        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">

            {/* Marca */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/landing" className="flex items-center gap-2 font-semibold">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">V</span>
                Versionly
              </Link>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Versionado de documentos con intención.
              </p>
            </div>

            {/* Producto */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Producto</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Editor', href: '/editor-preview' },
                  { label: 'Diff visual', href: '/diff-preview' },
                  { label: 'Funcionalidades', href: '#features' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Empresa</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Acerca de', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Contacto', href: '#' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Legal</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Privacidad', href: '#' },
                  { label: 'Términos', href: '#' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Versionly. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              Hecho con
              <span className="text-red-500">♥</span>
              en Argentina
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
