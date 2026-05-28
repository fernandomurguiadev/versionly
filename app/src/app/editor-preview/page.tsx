'use client';

import { useState } from 'react';
import { ChevronLeft, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Focus from '@tiptap/extension-focus';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { DEFAULT_SETTINGS, PAGE_WIDTHS, FONT_OPTIONS, type DocumentSettings, type FontFamily, type FontSize, type LineHeight, type PageWidth } from '@/lib/api/documents-settings';
import type { Editor } from '@tiptap/react';
import { Settings2, Check, RotateCcw, GitCompareArrows } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useCallback } from 'react';

const DEMO_CONTENT = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Propuesta de producto — Versionly v1.0' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Este documento describe el alcance del MVP, las decisiones técnicas y el plan de lanzamiento.' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '¿Qué problema resuelve?' }] },
    {
      type: 'paragraph', content: [
        { type: 'text', text: 'Los equipos trabajan con documentos vivos que cambian constantemente. Sin un sistema de versiones intencional, es imposible saber qué se aprobó, qué cambió y quién hizo cada modificación. Versionly resuelve esto con ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'versionado explícito, inmutable y compartible' },
        { type: 'text', text: '.' },
      ],
    },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Funcionalidades clave del MVP' }] },
    {
      type: 'taskList', content: [
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Editor de texto enriquecido con autoguardado' }] }] },
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Guardar versiones nombradas con comentario obligatorio' }] }] },
        { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diff visual entre versiones' }] }] },
        { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Links de compartición (fijo y dinámico)' }] }] },
      ],
    },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Stack tecnológico' }] },
    {
      type: 'table', content: [
        {
          type: 'tableRow', content: [
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Capa' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tecnología' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Versión' }] }] },
          ],
        },
        {
          type: 'tableRow', content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Frontend' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Next.js + TipTap + TanStack Query' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '16 / 3 / 5' }] }] },
          ],
        },
        {
          type: 'tableRow', content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Backend' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'NestJS + Prisma + PostgreSQL' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '10 / 5 / 16' }] }] },
          ],
        },
      ],
    },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Nota importante' }] },
    {
      type: 'blockquote', content: [{
        type: 'paragraph', content: [
          { type: 'text', text: '"El versioning con intención es la diferencia entre un documento vivo y un documento ' },
          { type: 'text', marks: [{ type: 'italic' }], text: 'olvidado' },
          { type: 'text', text: '." — Versionly' },
        ],
      }],
    },
  ],
};

// ─── Settings dropdown (local — sin backend en preview) ───────────────────────

function Opt<T extends string | number>({ label, value, current, onChange }: {
  label: string; value: T; current: T; onChange: (v: T) => void;
}) {
  return (
    <button type="button" onClick={() => onChange(value)}
      className={cn('flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition-colors w-full',
        current === value
          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
      )}>
      <span>{label}</span>
      {current === value && <Check className="h-3 w-3 shrink-0" />}
    </button>
  );
}

function SettingsDropdown({ settings, onChange }: { settings: DocumentSettings; onChange: (s: DocumentSettings) => void }) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof DocumentSettings>(k: K, v: DocumentSettings[K]) => onChange({ ...settings, [k]: v });

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} title="Estilo del documento"
        className={cn('flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors', open && 'bg-zinc-100 dark:bg-zinc-700')}>
        <Settings2 className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-60 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-xl space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Estilo del documento</p>
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">Fuente</p>
            {FONT_OPTIONS.map(({ value, label }) => (
              <Opt key={value} label={label} value={value} current={settings.fontFamily} onChange={v => set('fontFamily', v as FontFamily)} />
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">Tamaño</p>
            <div className="flex gap-1">
              {(['10pt','11pt','12pt'] as FontSize[]).map(s => (
                <Opt key={s} label={s} value={s} current={settings.fontSize} onChange={v => set('fontSize', v as FontSize)} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">Interlineado</p>
            <div className="flex gap-1">
              {([1.5,1.75,2.0] as LineHeight[]).map((lh,i) => (
                <Opt key={lh} label={['Simple','Normal','Doble'][i]} value={lh} current={settings.lineHeight} onChange={v => set('lineHeight', v as LineHeight)} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">Ancho</p>
            {(['compact','standard','wide'] as PageWidth[]).map((w,i) => (
              <Opt key={w} label={['Compacto','Estándar','Ancho'][i]} value={w} current={settings.pageWidth} onChange={v => set('pageWidth', v as PageWidth)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Save version button (local storage — demo) ────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

type SavedVersion = { name: string; comment: string; content: unknown; savedAt: string };

const STORAGE_KEY = 'versionly-demo-v3';

function persistVersions(versions: SavedVersion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
}

// Extrae texto plano de JSON de TipTap para el diff
function extractText(content: unknown): string {
  if (!content || typeof content !== 'object') return '';
  const node = content as Record<string, unknown>;
  if (node.type === 'text') return (node.text as string) ?? '';
  const children = (node.content as unknown[]) ?? [];
  return children.map(extractText).join(node.type === 'paragraph' || node.type?.toString().startsWith('heading') ? '\n' : ' ');
}

// ─── Save Version Button ──────────────────────────────────────────────────────

function SaveVersionButton({ editor, onSave }: { editor: Editor | null; onSave: (v: SavedVersion) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!name.trim() || !editor) return;
    const v: SavedVersion = { name: name.trim(), comment, content: editor.getJSON(), savedAt: new Date().toISOString() };
    onSave(v);
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); setName(''); setComment(''); }, 1200);
  }

  return (
    <>
      <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4" onClick={() => setOpen(true)}>
        Guardar versión
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-96 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div>
              <h2 className="text-base font-semibold">Guardar versión</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Las versiones son inmutables. Dale un nombre descriptivo.</p>
            </div>
            {saved ? (
              <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm py-2">
                <Check className="h-4 w-4" /> Versión guardada correctamente
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Nombre *</label>
                  <input autoFocus
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
                    placeholder="v2.0 — Revisión de scope"
                    value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Comentario (opcional)</label>
                  <input
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
                    placeholder="¿Qué cambió en esta versión?"
                    value={comment} onChange={e => setComment(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!name.trim()} onClick={handleSave}>
                    Guardar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Demo — Análisis funcional de "ClinicaApp" (5 versiones correlacionadas) ─
// Documento: sistema de gestión de turnos para clínicas.
// Evolución: borrador → estructura → scope cut → revisión técnica → aprobado.

const DEMO_VERSIONS: SavedVersion[] = [
  // ── v1.4 (más reciente): versión aprobada, completa ────────────────────────
  {
    // v1.4 — Análisis funcional final aprobado
    name: 'v1.4 — Aprobado por stakeholders',
    comment: 'Versión definitiva: todos los módulos confirmados, estimaciones revisadas y tabla de roles agregada.',
    savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Análisis Funcional — ClinicaApp v1.0' }] },
      { type: 'paragraph', content: [
        { type: 'text', text: 'Sistema de gestión de turnos para clínicas privadas. Esta versión fue ' },
        { type: 'text', marks: [{ type: 'textStyle', attrs: { color: '#16a34a' } }], text: 'aprobada el 28 de mayo por el cliente y el equipo técnico' },
        { type: 'text', text: '.' },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. Módulos del sistema' }] },
      { type: 'taskList', content: [
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Registro y autenticación de pacientes (email + SMS)' }] }] },
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reserva de turnos por especialidad y médico disponible' }] }] },
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Recordatorios automáticos 24h antes del turno (email + WhatsApp)' }] }] },
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Panel de médico: agenda diaria, historial de pacientes' }] }] },
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Panel admin: reportes, gestión de usuarios, configuración' }] }] },
        { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Integración con obras sociales (v2.0 — fuera del MVP)' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '2. Roles y permisos' }] },
      { type: 'table', content: [
        { type: 'tableRow', content: [
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rol' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Puede hacer' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'No puede hacer' }] }] },
        ]},
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Paciente' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reservar, cancelar, ver historial propio' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ver datos de otros pacientes' }] }] },
        ]},
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Médico' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ver agenda, confirmar/cancelar, agregar notas clínicas' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Modificar tarifas, acceder a reportes globales' }] }] },
        ]},
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Administrador' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Todo lo anterior + configuración + reportes + gestión de médicos' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '—' }] }] },
        ]},
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '3. Estimación' }] },
      { type: 'orderedList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sprint 1-2 — Auth, pacientes, médicos (2 sem)' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sprint 3-4 — Reservas, calendario, confirmaciones (2 sem)' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sprint 5-6 — Recordatorios, paneles, reportes (2 sem)' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sprint 7 — QA, ajustes, deploy (1 sem)' }] }] },
      ]},
      { type: 'blockquote', content: [{ type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'italic' }], text: 'Total estimado: 7 semanas con equipo de 3 personas (2 dev + 1 diseñador).' },
      ]}]},
    ]},
  },

  {
    // v1.3 — Revisión técnica: se agregaron constraints de arquitectura
    name: 'v1.3 — Revisión técnica',
    comment: 'Dev lead revisó el doc y agregó restricciones de arquitectura y modelo de datos.',
    savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Análisis Funcional — ClinicaApp v1.0' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Sistema de gestión de turnos para clínicas privadas. Versión con revisión técnica incorporada.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. Módulos del sistema' }] },
      { type: 'taskList', content: [
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Registro y autenticación de pacientes (email + SMS)' }] }] },
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reserva de turnos por especialidad y médico disponible' }] }] },
        { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Recordatorios automáticos 24h antes del turno (email + WhatsApp)' }] }] },
        { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Panel de médico: agenda diaria, historial de pacientes' }] }] },
        { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Panel admin: reportes, gestión de usuarios, configuración' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '2. Restricciones técnicas (nuevo)' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'highlight', attrs: { color: '#BFDBFE' } }], text: 'Agregado por dev lead en revisión del 25-may.' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'WhatsApp API requiere cuenta Business verificada — tiempo de aprobación estimado: 2-3 semanas. ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Riesgo alto para el sprint 5.' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'El calendario de médicos debe manejar zonas horarias. Usar ' }, { type: 'text', marks: [{ type: 'code' }], text: 'luxon' }, { type: 'text', text: ' para todos los cálculos de tiempo.' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Los datos clínicos son sensibles: aplicar cifrado en reposo y cumplir con Ley 25326 de protección de datos.' }] }] },
      ]},
      { type: 'codeBlock', attrs: { language: 'sql' }, content: [{ type: 'text', text: '-- Entidades principales\nCREATE TABLE pacientes (id UUID, nombre VARCHAR, email VARCHAR UNIQUE, created_at TIMESTAMPTZ);\nCREATE TABLE medicos (id UUID, nombre VARCHAR, especialidad VARCHAR, disponibilidad JSONB);\nCREATE TABLE turnos (id UUID, paciente_id UUID, medico_id UUID, fecha TIMESTAMPTZ, estado VARCHAR);' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '3. Estimación preliminar' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'La estimación sube de 6 a 7 semanas considerando el tiempo de setup de WhatsApp Business. Se actualizará en v1.4.' }] },
    ]},
  },

  {
    // v1.2 — Después de reunión con el cliente: scope recortado
    name: 'v1.2 — Scope recortado por cliente',
    comment: 'Reunión del 20-may: el cliente redujo el alcance del MVP para bajar presupuesto.',
    savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Análisis Funcional — ClinicaApp v1.0' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Sistema de gestión de turnos para clínicas privadas. Versión post-reunión con cliente.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. Módulos confirmados para el MVP' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Registro y autenticación de pacientes' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reserva de turnos' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Recordatorios automáticos (solo email en MVP, WhatsApp en v2)' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '2. Movido a v2.0' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'strike' }], text: 'Recordatorios por WhatsApp' },
          { type: 'text', text: ' — el cliente pidió bajar el costo inicial. Se pasa a v2.' },
        ]}]},
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'strike' }], text: 'Integración con obras sociales' },
          { type: 'text', text: ' — requiere negociación con prestadoras. Fuera de MVP.' },
        ]}]},
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'strike' }], text: 'App móvil nativa' },
          { type: 'text', text: ' — solo web responsiva para MVP.' },
        ]}]},
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '3. Estimación actualizada' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Con el scope reducido la estimación baja de 12 semanas a 6 semanas. Equipo: 2 desarrolladores + 1 diseñador part-time.' }] },
    ]},
  },

  {
    // v1.1 — Primera estructura organizada
    name: 'v1.1 — Primera estructura',
    comment: 'Se organizó el borrador en secciones y se agregaron las user stories básicas.',
    savedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Análisis Funcional — ClinicaApp v1.0' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Sistema de gestión de turnos para clínicas privadas. Primer borrador estructurado.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. Módulos propuestos' }] },
      { type: 'bulletList', content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Registro y autenticación de pacientes y médicos' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reserva de turnos online con selector de especialidad y médico' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Recordatorios automáticos por email y WhatsApp' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Panel de médico con agenda diaria y semanal' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Panel administrativo con reportes y estadísticas' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Integración con obras sociales principales del país' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'App móvil nativa iOS/Android' }] }] },
      ]},
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '2. User stories principales' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Como paciente, quiero reservar un turno en menos de 3 pasos desde mi celular, sin necesidad de llamar.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Como médico, quiero ver mi agenda del día al abrir la app, con nombre del paciente y motivo de consulta.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Como administrador, quiero ver cuántos turnos se cancelaron en el mes y por qué motivo.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '3. Estimación preliminar' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Estimación inicial: 12 semanas con un equipo de 4 personas. Pendiente de revisión con el cliente.' }] },
    ]},
  },

  {
    // v1.0 — Borrador inicial: solo la idea
    name: 'v1.0 — Borrador inicial',
    comment: 'Idea inicial capturada después de la primera llamada con el cliente.',
    savedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'ClinicaApp — Ideas iniciales' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'El cliente tiene una clínica con 8 médicos. El problema principal es que el sistema actual es papel y teléfono. Los pacientes llaman, la recepcionista anota en un libro, y se genera un caos de turnos solapados, ausencias sin aviso y pacientes que esperan más de una hora.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Lo que piden: que los pacientes puedan sacar turno desde la web o el celular, sin llamar. Que el médico sepa quién viene y a qué hora. Que se mande un recordatorio antes del turno para reducir los ausentes.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Otras cosas que mencionaron: reportes de facturación, integración con obras sociales, app para el médico. Pero lo urgente es el turno online.' }] },
      { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'highlight', attrs: { color: '#FEF08A' } }], text: 'TODO: organizar esto en secciones y definir el alcance real del MVP con el cliente.' }] },
    ]},
  },
];

// ─── Versions panel interactivo ───────────────────────────────────────────────

// ─── Versions Panel (estado elevado al padre) ────────────────────────────────

type VersionsPanelProps = {
  versions: SavedVersion[];
  currentIdx: number;
  onLoad: (idx: number) => void;
  onDelete: (idx: number) => void;
  onCompare: (idxA: number, idxB: number) => void;
};

function VersionsPanel({ versions, currentIdx, onLoad, onDelete, onCompare }: VersionsPanelProps) {
  const [compareSource, setCompareSource] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  function relativeDate(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'ahora mismo';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  }

  function handleCompareClick(e: React.MouseEvent, idx: number) {
    e.stopPropagation();
    if (compareSource === null) {
      setCompareSource(idx);
    } else if (compareSource === idx) {
      setCompareSource(null);
    } else {
      onCompare(compareSource, idx);
      setCompareSource(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {compareSource !== null && (
        <div className="sticky top-0 z-10 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <span className="font-medium">Modo comparación:</span> hacé click en otra versión para comparar con <span className="font-semibold">{versions[compareSource]?.name}</span>
          <button className="ml-2 underline" onClick={() => setCompareSource(null)}>Cancelar</button>
        </div>
      )}

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {versions.map((v, i) => {
          const isCurrent = currentIdx === i;
          const isCompareSource = compareSource === i;
          const isCompareTarget = compareSource !== null && compareSource !== i;

          return (
            <div
              key={`${v.name}-${i}`}
              className={cn(
                'p-3 cursor-pointer transition-colors group relative',
                isCurrent        && 'bg-blue-50 dark:bg-blue-900/20',
                isCompareSource  && 'bg-amber-50 dark:bg-amber-900/20',
                isCompareTarget  && 'hover:bg-amber-50 dark:hover:bg-amber-900/10',
                !isCurrent && !isCompareSource && !isCompareTarget && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
              )}
              onClick={() => compareSource !== null ? handleCompareClick({ stopPropagation: () => {} } as React.MouseEvent, i) : onLoad(i)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isCurrent       && 'text-blue-700 dark:text-blue-300',
                    isCompareSource && 'text-amber-700 dark:text-amber-300',
                  )}>
                    {v.name}
                  </p>
                  {v.comment && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{v.comment}</p>
                  )}
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{relativeDate(v.savedAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {isCurrent && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                      Actual
                    </span>
                  )}
                  {isCompareSource && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                      Base
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              {compareSource === null && (
                <div className={cn(
                  'flex gap-1 mt-2 transition-all',
                  isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}>
                  {!isCurrent && (
                    <button type="button" onClick={e => { e.stopPropagation(); onLoad(i); }}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                      <RotateCcw className="h-3 w-3" /> Restaurar
                    </button>
                  )}
                  <button type="button" onClick={e => handleCompareClick(e, i)}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                    <GitCompareArrows className="h-3 w-3" /> Comparar
                  </button>
                  {deleteConfirm === i ? (
                    <>
                      <button type="button" onClick={e => { e.stopPropagation(); onDelete(i); setDeleteConfirm(null); }}
                        className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium">
                        Confirmar
                      </button>
                      <button type="button" onClick={e => { e.stopPropagation(); setDeleteConfirm(null); }}
                        className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                        No
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={e => { e.stopPropagation(); setDeleteConfirm(i); }}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors">
                      Eliminar
                    </button>
                  )}
                </div>
              )}
              {compareSource !== null && compareSource !== i && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">Click para comparar →</p>
              )}
            </div>
          );
        })}
        {versions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
            <p className="text-sm font-medium text-zinc-500">Sin versiones</p>
            <p className="text-xs text-zinc-400">Guardá una versión para empezar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const FONT_CSS: Record<string, string> = {
  serif: '"Georgia", serif',
  sans:  'var(--font-geist-sans), sans-serif',
  mono:  'var(--font-geist-mono), monospace',
};

export default function EditorPreviewPage() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_SETTINGS);

  // ── Estado compartido de versiones ────────────────────────────────────────
  const [versions, setVersions] = useState<SavedVersion[]>(() => {
    if (typeof window === 'undefined') return DEMO_VERSIONS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_VERSIONS));
      return DEMO_VERSIONS;
    }
    return JSON.parse(stored);
  });
  const [currentIdx, setCurrentIdx] = useState(0);

  function saveVersionList(newVersions: SavedVersion[]) {
    setVersions(newVersions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVersions));
  }

  function handleSave(v: SavedVersion) {
    saveVersionList([v, ...versions]);
    setCurrentIdx(0);
  }

  function handleLoad(idx: number) {
    editor?.commands.setContent(versions[idx].content as object);
    setCurrentIdx(idx);
  }

  function handleDelete(idx: number) {
    const next = versions.filter((_, i) => i !== idx);
    saveVersionList(next.length > 0 ? next : DEMO_VERSIONS);
    const newIdx = idx === 0 ? 0 : Math.min(idx - 1, next.length - 1);
    if (next[newIdx]) {
      editor?.commands.setContent(next[newIdx].content as object);
      setCurrentIdx(newIdx);
    }
  }

  function handleCompare(idxA: number, idxB: number) {
    const vA = versions[idxA];
    const vB = versions[idxB];
    localStorage.setItem('versionly-compare', JSON.stringify({
      nameA: vA.name, dateA: vA.savedAt, textA: extractText(vA.content),
      nameB: vB.name, dateB: vB.savedAt, textB: extractText(vB.content),
    }));
    window.location.href = '/diff-preview';
  }

  // ── Editor ────────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Placeholder.configure({ placeholder: 'Empezá a escribir…' }),
      Underline, Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color, Highlight.configure({ multicolor: true }),
      TaskList, TaskItem.configure({ nested: true }),
      Typography, CharacterCount, Superscript, Subscript,
      Table.configure({ resizable: false }),
      TableRow, TableHeader, TableCell, Image,
      Focus.configure({ className: 'has-focus', mode: 'all' }),
    ],
    content: versions[0]?.content as object ?? DEMO_CONTENT,
    editorProps: { attributes: { class: 'editor-content focus:outline-none' } },
  });

  const charCount = editor?.storage.characterCount;

  // Nombre del documento actual
  const currentVersion = versions[currentIdx];

  if (!editor) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white text-xs font-bold shrink-0">V</div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none truncate">Análisis Funcional — ClinicaApp</p>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {currentVersion ? `Viendo: ${currentVersion.name}` : 'Borrador'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="sm" className={cn('gap-1.5 h-8 text-xs', panelOpen && 'bg-zinc-100 dark:bg-zinc-800')} onClick={() => setPanelOpen(p => !p)}>
            <Clock className="h-3.5 w-3.5" />
            {versions.length > 0 && <span className="tabular-nums">{versions.length}</span>}
            <span className="hidden sm:inline">Versiones</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs text-zinc-600">
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
          <SettingsDropdown settings={settings} onChange={setSettings} />
          <ThemeToggle />
          <SaveVersionButton editor={editor} onSave={handleSave} />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <EditorToolbar editor={editor} />
          <div className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-900">
            <div className={`mx-auto my-8 w-full ${PAGE_WIDTHS[settings.pageWidth]}`}>
              <div
                className="rounded-sm bg-white dark:bg-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_4px_20px_rgba(0,0,0,0.3)] min-h-[1056px] px-[96px] py-[96px]"
                style={{ fontFamily: FONT_CSS[settings.fontFamily], fontSize: settings.fontSize, lineHeight: settings.lineHeight }}
              >
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-1.5">
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>{charCount?.words() ?? 0} palabras</span>
              <span>{charCount?.characters() ?? 0} caracteres</span>
            </div>
            <span className="text-xs text-zinc-400">Demo · localStorage</span>
          </div>
        </div>

        {panelOpen && (
          <aside className="w-72 shrink-0 border-l border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Versiones</p>
              <span className="text-xs text-zinc-400 tabular-nums">{versions.length}</span>
            </div>
            <VersionsPanel
              versions={versions}
              currentIdx={currentIdx}
              onLoad={handleLoad}
              onDelete={handleDelete}
              onCompare={handleCompare}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
