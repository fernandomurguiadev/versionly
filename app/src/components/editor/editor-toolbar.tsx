'use client';

import { useState } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks,
  Link2, ImageIcon, Table2, Quote, Code, Minus,
  Undo2, Redo2, ChevronDown, Highlighter, Superscript, Subscript,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ToolbarProps = { editor: Editor };

function Btn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded transition-all duration-100',
        'disabled:pointer-events-none disabled:opacity-30',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-zinc-200" />;
}

const TEXT_COLORS = [
  '#000000', '#1F2937', '#6B7280', '#9CA3AF',
  '#DC2626', '#EA580C', '#CA8A04', '#16A34A',
  '#2563EB', '#7C3AED', '#DB2777', '#0891B2',
];

const HIGHLIGHT_COLORS = [
  '#FEF08A', '#BBF7D0', '#BFDBFE', '#F5D0FE',
  '#FED7AA', '#FECACA', '#A7F3D0', '#93C5FD',
  '#C4B5FD', '#F9A8D4', '#FDE68A', '#99F6E4',
];

function ColorPickerDropdown({
  open, colors, onSelect, onReset, resetLabel,
}: {
  open: boolean;
  colors: string[];
  onSelect: (color: string) => void;
  onReset: () => void;
  resetLabel: string;
}) {
  if (!open) return null;
  return (
    <div className="absolute top-full left-0 z-30 mt-1 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl min-w-[168px]">
      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onSelect(c); }}
            className="h-7 w-7 rounded-md border border-zinc-200 shadow-sm transition-all hover:scale-110 hover:shadow-md"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="border-t border-zinc-100 pt-2">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onReset(); }}
          className="w-full rounded-md py-1 text-center text-xs text-zinc-500 hover:bg-zinc-100 transition-colors"
        >
          {resetLabel}
        </button>
      </div>
    </div>
  );
}

const HEADINGS = [
  { label: 'Párrafo', value: 0, className: 'text-sm' },
  { label: 'Título 1', value: 1, className: 'text-xl font-bold' },
  { label: 'Título 2', value: 2, className: 'text-lg font-bold' },
  { label: 'Título 3', value: 3, className: 'text-base font-semibold' },
  { label: 'Título 4', value: 4, className: 'text-sm font-semibold' },
];

function TextColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const currentColor = editor.getAttributes('textStyle').color ?? '#000';
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="flex h-7 w-9 flex-col items-center justify-center gap-0.5 rounded hover:bg-zinc-100 transition-colors"
        title="Color de texto"
      >
        <span className="text-xs font-bold leading-none" style={{ color: currentColor }}>A</span>
        <div className="h-[3px] w-4 rounded-full" style={{ backgroundColor: currentColor }} />
      </button>
      <ColorPickerDropdown
        open={open}
        colors={TEXT_COLORS}
        onSelect={(c) => editor.chain().focus().setColor(c).run()}
        onReset={() => editor.chain().focus().unsetColor().run()}
        resetLabel="Restablecer color"
      />
    </div>
  );
}

function HighlightPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const currentColor = editor.getAttributes('highlight').color ?? '#FEF08A';
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="flex h-7 w-9 flex-col items-center justify-center gap-0.5 rounded hover:bg-zinc-100 transition-colors"
        title="Color de resaltado"
      >
        <Highlighter className="h-3.5 w-3.5 text-zinc-500" />
        <div className="h-[3px] w-4 rounded-full" style={{ backgroundColor: currentColor }} />
      </button>
      <ColorPickerDropdown
        open={open}
        colors={HIGHLIGHT_COLORS}
        onSelect={(c) => editor.chain().focus().setHighlight({ color: c }).run()}
        onReset={() => editor.chain().focus().unsetHighlight().run()}
        resetLabel="Quitar resaltado"
      />
    </div>
  );
}

export function EditorToolbar({ editor }: ToolbarProps) {
  const currentHeading =
    HEADINGS.find((h) =>
      h.value === 0
        ? !editor.isActive('heading')
        : editor.isActive('heading', { level: h.value }),
    ) ?? HEADINGS[0];

  function applyHeading(level: number) {
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setHeading({ level: level as 1 | 2 | 3 | 4 }).run();
  }

  function promptLink() {
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('URL del enlace:', prev.startsWith('http') ? prev : 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  }

  function promptImage() {
    const url = window.prompt('URL de la imagen:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-white/95 backdrop-blur-sm px-3 py-1.5 sticky top-0 z-10">
      {/* Historial */}
      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Deshacer (Ctrl+Z)">
        <Undo2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rehacer (Ctrl+Y)">
        <Redo2 className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Tipo de texto */}
      <div className="group relative">
        <button
          type="button"
          className="flex h-7 min-w-[88px] items-center justify-between gap-1 rounded px-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          <span>{currentHeading.label}</span>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>
        <div className="absolute top-full left-0 z-30 mt-1 hidden w-44 rounded-lg border border-zinc-100 bg-white py-1 shadow-xl group-hover:block">
          {HEADINGS.map((h) => (
            <button
              key={h.value}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyHeading(h.value); }}
              className={cn(
                'flex w-full items-center px-3 py-2 text-left transition-colors hover:bg-zinc-50',
                h.className,
                currentHeading.value === h.value && 'text-primary',
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <Sep />

      {/* Formato de texto */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita (Ctrl+B)">
        <Bold className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálica (Ctrl+I)">
        <Italic className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado (Ctrl+U)">
        <Underline className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
        <Strikethrough className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código">
        <Code2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superíndice">
        <Superscript className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subíndice">
        <Subscript className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Color de texto */}
      <TextColorPicker editor={editor} />

      {/* Resaltado */}
      <HighlightPicker editor={editor} />

      <Sep />

      {/* Alineación */}
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinear izquierda">
        <AlignLeft className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">
        <AlignCenter className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinear derecha">
        <AlignRight className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar">
        <AlignJustify className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Listas */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista con viñetas">
        <List className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
        <ListOrdered className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Lista de tareas (checklist)">
        <ListChecks className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Insertar */}
      <Btn onClick={promptLink} active={editor.isActive('link')} title="Insertar enlace (Ctrl+K)">
        <Link2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={promptImage} title="Insertar imagen">
        <ImageIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insertar tabla">
        <Table2 className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Bloques */}
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita">
        <Quote className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloque de código">
        <Code className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador horizontal">
        <Minus className="h-3.5 w-3.5" />
      </Btn>
    </div>
  );
}
