'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, Columns2, AlignLeft, Plus, Minus, ChevronsUpDown } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  computeDiff, computeAlignedLineDiff, diffStats, segmentRows,
  type DiffChunk, type DiffRow, type DiffSegment,
} from '@/lib/diff/compute';

// ─── Demo content ─────────────────────────────────────────────────────────────

const VERSION_A = {
  name: 'v1.0 — Primera entrega',
  date: 'hace 5 días',
  text: `Propuesta de integración con Google Drive

Este documento describe el enfoque técnico para integrar Versionly con Google Drive usando OAuth2.

Alcance del trabajo

Los usuarios podrán conectar su cuenta de Google Drive al workspace y desde ahí importar documentos. La integración usará autenticación OAuth2 con permisos de solo lectura.

Funcionalidades incluidas:
- Autenticación OAuth2 con scopes mínimos
- Importación manual de archivos desde Drive
- Conversión de .docx a formato interno
- Interfaz de selección de archivos

Consideraciones de seguridad

Los tokens de acceso se almacenan en la base de datos. El scope solicitado es drive.readonly. El proceso de refresh es manual cuando el token expira.

Estimación de desarrollo: 2 semanas.

El equipo frontend necesitará integrar el SDK de Google para el picker.`,
};

const VERSION_B = {
  name: 'v1.2 — Revisión técnica',
  date: 'hace 2 días',
  text: `Propuesta de integración con Google Drive (v1.1)

Este documento describe el enfoque técnico para integrar Versionly con Google Drive usando OAuth2. La integración es completamente opcional: si el usuario no conecta Drive, la aplicación funciona sin ningún cambio.

Alcance del trabajo

Los usuarios podrán conectar su cuenta de Google Drive al workspace y desde ahí importar documentos de forma intencional. La integración usará autenticación OAuth2 con permisos mínimos de solo lectura.

Funcionalidades incluidas:
- Autenticación OAuth2 con scopes mínimos (drive.readonly + drive.metadata.readonly)
- Importación intencional de archivos desde Drive (el usuario decide cuándo importar)
- Conversión de .docx a formato interno usando mammoth.js
- Interfaz de selección de archivos (Drive File Picker modal)
- Mapeo 1:1 entre documento Versionly y archivo de Drive

Consideraciones de seguridad

Los tokens de acceso se almacenan cifrados con AES-256-GCM en la base de datos. El scope solicitado es drive.readonly y drive.metadata.readonly. El proceso de refresh es automático y transparente al usuario. Los tokens nunca se exponen al frontend.

Estimación de desarrollo: 3 semanas.

El equipo frontend NO necesita integrar el SDK de Google — toda la comunicación con Drive ocurre en el backend.`,
};

// ─── Flatten segments → visible rows ─────────────────────────────────────────

type FlatItem =
  | { kind: 'row';       row: DiffRow }
  | { kind: 'collapsed'; segIdx: number; count: number };

function flattenSegments(segments: DiffSegment[], expanded: Set<number>): FlatItem[] {
  const items: FlatItem[] = [];
  segments.forEach((seg, idx) => {
    if (seg.type === 'collapsed' && !expanded.has(idx)) {
      items.push({ kind: 'collapsed', segIdx: idx, count: seg.count });
    } else {
      for (const row of seg.rows) {
        items.push({ kind: 'row', row });
      }
    }
  });
  return items;
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function InlineChunks({ chunks }: { chunks: DiffChunk[] }) {
  return (
    <>
      {chunks.map(([op, text], i) => {
        if (op === 0)  return <span key={i}>{text}</span>;
        if (op === 1)  return <mark key={i} className="bg-emerald-100 text-emerald-900 rounded-[2px] px-[1px]">{text}</mark>;
        if (op === -1) return <del  key={i} className="bg-red-100 text-red-800 rounded-[2px] px-[1px] line-through">{text}</del>;
      })}
    </>
  );
}

const ROW_BG = {
  equal:  { left: 'bg-white',   right: 'bg-white' },
  delete: { left: 'bg-red-50',  right: 'bg-zinc-50/60' },
  insert: { left: 'bg-zinc-50/60', right: 'bg-emerald-50' },
  modify: { left: 'bg-red-50',  right: 'bg-emerald-50' },
} as const;

const NUM_CLS = {
  equal:  { left: 'text-zinc-400', right: 'text-zinc-400' },
  delete: { left: 'text-red-400',  right: 'text-zinc-300' },
  insert: { left: 'text-zinc-300', right: 'text-emerald-500' },
  modify: { left: 'text-red-400',  right: 'text-emerald-500' },
} as const;

function RowCell({ row, side }: { row: DiffRow; side: 'left' | 'right' }) {
  const bg  = ROW_BG[row.type][side];
  const num = side === 'left' ? row.leftNum  : row.rightNum;
  const numCls = NUM_CLS[row.type][side];
  const content = side === 'left' ? row.left : row.right;
  const chunks  = side === 'left' ? row.leftChunks : row.rightChunks;

  return (
    <div className={`flex min-h-[28px] border-b border-zinc-100 ${bg}`}>
      {/* Line number */}
      <div className={`w-[38px] shrink-0 select-none border-r border-zinc-200 px-2 py-[3px] text-right font-mono text-[11px] leading-[22px] ${numCls} bg-opacity-60`}>
        {num ?? ''}
      </div>
      {/* Content */}
      <div className="flex-1 py-[3px] pl-3 pr-2 font-['Georgia',serif] text-[13px] leading-[22px] whitespace-pre-wrap break-words text-zinc-800">
        {content === null ? (
          <span className="inline-block" />
        ) : row.type === 'modify' && chunks ? (
          <InlineChunks chunks={chunks} />
        ) : row.type === 'delete' && side === 'left' ? (
          <span className="text-red-800 line-through opacity-80">{content}</span>
        ) : row.type === 'insert' && side === 'right' ? (
          <span className="text-emerald-900">{content}</span>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

function CollapsedRow({ count, onExpand }: { count: number; onExpand: () => void }) {
  return (
    <div className="flex border-b border-zinc-100 bg-zinc-50/80">
      <div className="w-[38px] shrink-0 border-r border-zinc-200 bg-zinc-100" />
      <div className="flex flex-1 items-center border-r border-zinc-200">
        <button
          type="button"
          onClick={onExpand}
          className="flex w-full items-center justify-center gap-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" />
          <span>{count} líneas sin cambios · Expandir</span>
        </button>
      </div>
      <div className="w-[38px] shrink-0 border-r border-zinc-200 bg-zinc-100" />
      <div className="flex-1">
        <button
          type="button"
          onClick={onExpand}
          className="flex w-full items-center justify-center gap-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" />
          <span>{count} líneas sin cambios · Expandir</span>
        </button>
      </div>
    </div>
  );
}

// ─── Split view (virtual) ─────────────────────────────────────────────────────

function SplitView({ rows }: { rows: DiffRow[] }) {
  const segments = useMemo(() => segmentRows(rows, 5), [rows]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const items = useMemo(() => flattenSegments(segments, expanded), [segments, expanded]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
    overscan: 15,
  });

  function expand(segIdx: number) {
    setExpanded((prev) => new Set([...prev, segIdx]));
  }

  return (
    <div ref={scrollRef} className="h-full overflow-auto">
      {/* Column headers */}
      <div className="sticky top-0 z-10 flex border-b border-zinc-200 bg-white text-xs font-medium shadow-sm">
        <div className="flex w-[calc(50%+1px)] items-center gap-2 border-r border-zinc-200 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
          <span className="text-red-700 truncate">v1.0 — Primera entrega</span>
        </div>
        <div className="flex flex-1 items-center gap-2 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-emerald-700 truncate">v1.2 — Revisión técnica</span>
        </div>
      </div>

      {/* Virtual rows */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((vItem) => {
          const item = items[vItem.index];
          return (
            <div
              key={vItem.key}
              data-index={vItem.index}
              ref={virtualizer.measureElement}
              style={{ position: 'absolute', top: vItem.start, left: 0, right: 0 }}
            >
              {item.kind === 'collapsed' ? (
                <CollapsedRow count={item.count} onExpand={() => expand(item.segIdx)} />
              ) : (
                <div className="flex">
                  <div className="flex-1 border-r border-zinc-200">
                    <RowCell row={item.row} side="left" />
                  </div>
                  <div className="flex-1">
                    <RowCell row={item.row} side="right" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Inline view ──────────────────────────────────────────────────────────────

const INLINE_COLLAPSE_CHARS = 300;

function InlineView({ chunks }: { chunks: DiffChunk[] }) {
  const [showAll, setShowAll] = useState(false);

  // Collapse large equal blocks in the inline view
  const rendered = useMemo(() => {
    if (showAll) return chunks;
    return chunks.map(([op, text]): DiffChunk => {
      if (op !== 0 || text.length <= INLINE_COLLAPSE_CHARS) return [op, text];
      const head = text.slice(0, 120);
      const tail = text.slice(-80);
      const hidden = text.length - head.length - tail.length;
      return [op, `${head}\n\n[… ${hidden} caracteres sin cambios …]\n\n${tail}`];
    });
  }, [chunks, showAll]);

  return (
    <div className="mx-auto my-8 w-full max-w-[760px]">
      <div className="bg-white rounded shadow-[0_1px_3px_rgba(0,0,0,0.10),0_4px_20px_rgba(0,0,0,0.06)] px-16 py-14">
        <div className="font-['Georgia',serif] text-[15px] leading-[1.85] text-zinc-800 whitespace-pre-wrap">
          {rendered.map(([op, text], i) => {
            if (op === 0)  return <span key={i}>{text}</span>;
            if (op === 1)  return <ins key={i} className="no-underline bg-emerald-100 text-emerald-900 rounded-[2px] px-[1px]">{text}</ins>;
            if (op === -1) return <del key={i} className="bg-red-100 text-red-800 line-through rounded-[2px] px-[1px]">{text}</del>;
          })}
        </div>
        {!showAll && chunks.some(([op, t]) => op === 0 && t.length > INLINE_COLLAPSE_CHARS) && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            Mostrar documento completo
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Mode = 'inline' | 'split';

type CompareData = {
  nameA: string; dateA: string; textA: string;
  nameB: string; dateB: string; textB: string;
};

export default function DiffPreviewPage() {
  const [mode, setMode] = useState<Mode>('split');
  const [diffReady, setDiffReady] = useState(false);
  const [rows,   setRows]   = useState<DiffRow[]>([]);
  const [chunks, setChunks] = useState<DiffChunk[]>([]);
  const [stats,  setStats]  = useState({ added: 0, removed: 0 });
  const [vA, setVA] = useState(VERSION_A);
  const [vB, setVB] = useState(VERSION_B);

  useEffect(() => {
    // Leer versiones reales del localStorage si vienen del editor-preview
    const stored = localStorage.getItem('versionly-compare');
    if (stored) {
      try {
        const data: CompareData = JSON.parse(stored);
        setVA({ name: data.nameA, date: new Date(data.dateA).toLocaleDateString('es'), text: data.textA });
        setVB({ name: data.nameB, date: new Date(data.dateB).toLocaleDateString('es'), text: data.textB });
      } catch { /* usa los defaults */ }
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const r = computeAlignedLineDiff(vA.text, vB.text);
      const c = computeDiff(vA.text, vB.text);
      setRows(r);
      setChunks(c);
      setStats(diffStats(c));
      setDiffReady(true);
    }, 0);
    return () => clearTimeout(id);
  }, [vA, vB]);

  const changeCount = rows.filter(r => r.type !== 'equal').length;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50">

      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4">
        <Link href="/editor-preview" className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-xs font-medium text-red-700 truncate">{vA.name}</span>
          </span>
          <span className="text-zinc-400 shrink-0">→</span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-emerald-700 truncate">{vB.name}</span>
          </span>
        </div>
        <ThemeToggle />
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-0.5">
          {(['split', 'inline'] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${mode === m ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {m === 'split' ? <Columns2 className="h-3.5 w-3.5" /> : <AlignLeft className="h-3.5 w-3.5" />}
              {m === 'split' ? 'Lado a lado' : 'Inline'}
            </button>
          ))}
        </div>
      </header>

      {/* Stats bar */}
      <div className="flex h-9 shrink-0 items-center gap-5 border-b border-zinc-100 bg-white px-5">
        {diffReady ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Plus className="h-3.5 w-3.5 text-emerald-500" />+{stats.added} palabras
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-700">
              <Minus className="h-3.5 w-3.5 text-red-500" />−{stats.removed} palabras
            </span>
            <span className="text-xs text-zinc-400">{changeCount} líneas modificadas</span>
          </>
        ) : (
          <span className="text-xs text-zinc-400 animate-pulse">Calculando diferencias…</span>
        )}
        <span className="ml-auto text-xs text-zinc-400">{vB.date}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!diffReady ? (
          // Skeleton
          <div className="space-y-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex h-7 border-b border-zinc-100 animate-pulse">
                <div className="w-[38px] border-r border-zinc-200 bg-zinc-100" />
                <div className="flex-1 border-r border-zinc-200 px-3 py-1">
                  <div className={`h-3 rounded bg-zinc-100 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-5/6'}`} />
                </div>
                <div className="w-[38px] border-r border-zinc-200 bg-zinc-100" />
                <div className="flex-1 px-3 py-1">
                  <div className={`h-3 rounded bg-zinc-100 ${i % 3 === 0 ? 'w-2/3' : i % 3 === 1 ? 'w-4/5' : 'w-3/5'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : mode === 'split' ? (
          <SplitView rows={rows} />
        ) : (
          <div className="h-full overflow-y-auto">
            <InlineView chunks={chunks} />
          </div>
        )}
      </div>
    </div>
  );
}
