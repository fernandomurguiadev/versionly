export type EditorCommandContext = {
  getEditor: () => HTMLDivElement | null;
  getParagraphSpacing: () => number;
  getLineSpacing: () => string;
  getPageMargin: () => number;
  setHtml: (html: string) => void;
  markDirty: () => void;
  scheduleAutosave: () => void;
};

export class DocumentEditorCommands {
  constructor(private readonly ctx: EditorCommandContext) {}
  focusEditor() {
    this.ctx.getEditor()?.focus();
  }
  captureEditorState() {
    const editor = this.ctx.getEditor();
    if (!editor) {
      return;
    }
    this.ctx.setHtml(editor.innerHTML);
    this.ctx.markDirty();
    this.ctx.scheduleAutosave();
  }
  applyParagraphSpacing(silent: boolean) {
    const editor = this.ctx.getEditor();
    if (!editor) {
      return;
    }
    const spacing = this.ctx.getParagraphSpacing();
    editor.querySelectorAll('p').forEach((p) => {
      p.style.marginBottom = `${spacing}px`;
    });
    if (!silent) {
      this.captureEditorState();
    }
  }
  applyFormat(command: 'bold' | 'italic' | 'underline') {
    this.focusEditor();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command);
    this.captureEditorState();
  }
  setAlignment(alignment: 'left' | 'center' | 'right' | 'justify') {
    this.focusEditor();
    document.execCommand('styleWithCSS', false, 'true');
    const command = alignment === 'left' ? 'justifyLeft' : alignment === 'center' ? 'justifyCenter' : alignment === 'right' ? 'justifyRight' : 'justifyFull';
    document.execCommand(command);
    this.captureEditorState();
  }
  setFontName(font: string) {
    this.focusEditor();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('fontName', false, font);
    this.captureEditorState();
  }
  setFontSize(size: string) {
    this.focusEditor();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('fontSize', false, size);
    this.captureEditorState();
  }
  setLineSpacing(value: string) {
    const editor = this.ctx.getEditor();
    if (!editor) {
      return;
    }
    editor.style.lineHeight = value;
    this.captureEditorState();
  }
  setPageMargin(value: number) {
    const editor = this.ctx.getEditor();
    if (!editor) {
      return;
    }
    editor.style.padding = `${value}px`;
    this.captureEditorState();
  }
  insertLink() {
    const url = prompt('URL del enlace');
    const trimmed = url?.trim();
    if (!trimmed) {
      return;
    }
    this.focusEditor();
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().trim().length > 0;
    if (hasSelection) {
      document.execCommand('createLink', false, trimmed);
    } else {
      const text = prompt('Texto del enlace')?.trim() || trimmed;
      document.execCommand('insertHTML', false, `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(text)}</a>`);
    }
    this.captureEditorState();
  }
  insertImage() {
    const url = prompt('URL de la imagen');
    const trimmed = url?.trim();
    if (!trimmed) {
      return;
    }
    this.focusEditor();
    document.execCommand('insertImage', false, trimmed);
    this.captureEditorState();
  }
  insertTable() {
    const rowsValue = Number(prompt('Filas', '2'));
    const colsValue = Number(prompt('Columnas', '2'));
    if (!Number.isFinite(rowsValue) || !Number.isFinite(colsValue) || rowsValue < 1 || colsValue < 1) {
      return;
    }
    const rows = Math.min(Math.floor(rowsValue), 10);
    const cols = Math.min(Math.floor(colsValue), 10);
    const body = Array.from({ length: rows }).map(() => `<tr>${Array.from({ length: cols }).map(() => '<td style="border:1px solid #e5e7eb;padding:6px;">&nbsp;</td>').join('')}</tr>`).join('');
    const table = `<table style="border-collapse:collapse;width:100%;margin:8px 0;">${body}</table><p></p>`;
    this.focusEditor();
    document.execCommand('insertHTML', false, table);
    this.captureEditorState();
  }
  insertOrderedList() {
    this.focusEditor();
    document.execCommand('insertOrderedList');
    this.captureEditorState();
  }
  insertUnorderedList() {
    this.focusEditor();
    document.execCommand('insertUnorderedList');
    this.captureEditorState();
  }
  syncEditorContent(html: string) {
    const editor = this.ctx.getEditor();
    if (!editor) {
      setTimeout(() => this.syncEditorContent(html), 0);
      return;
    }
    editor.innerHTML = html;
    editor.style.padding = `${this.ctx.getPageMargin()}px`;
    editor.style.lineHeight = this.ctx.getLineSpacing();
    this.applyParagraphSpacing(true);
  }
  private escapeHtml(text: string) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
