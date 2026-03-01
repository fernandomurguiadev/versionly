import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiResponse, DraftResponse } from './document-detail.models';
import { formatHttpError, resolveContentHtmlValue, serializeDraftContent } from './document-detail.utils';
import { DocumentEditorCommands } from './document-editor.commands';

@Component({
  selector: 'app-document-editor-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-editor-panel.component.html',
})
export class DocumentEditorPanelComponent implements OnInit, OnDestroy, OnChanges {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/v1';
  @Input() docId = '';
  @Input() canEdit = false;
  @Input() initialContent: Record<string, unknown> | null = null;
  @ViewChild('editor') editorRef?: ElementRef<HTMLDivElement>;
  draftContent: Record<string, unknown> | null = null;
  draftError = '';
  draftHtml = '';
  draftSaveError = '';
  draftSaveStatus = '';
  isDraftDirty = false;
  autosaveHandle: ReturnType<typeof setTimeout> | null = null;
  autosaveIntervalHandle: ReturnType<typeof setInterval> | null = null;
  isAutosaving = false;
  availableFonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Tahoma'];
  fontSizeOptions = [{ label: '12', value: '2' }, { label: '14', value: '3' }, { label: '16', value: '4' }, { label: '18', value: '5' }, { label: '24', value: '6' }, { label: '32', value: '7' }];
  selectedFont = 'Inter';
  selectedFontSize = '3';
  lineSpacingOptions = [{ label: '1.0', value: '1' }, { label: '1.15', value: '1.15' }, { label: '1.5', value: '1.5' }, { label: '2.0', value: '2' }];
  paragraphSpacingOptions = [{ label: '0', value: 0 }, { label: '4', value: 4 }, { label: '8', value: 8 }, { label: '12', value: 12 }, { label: '16', value: 16 }];
  pageMarginOptions = [{ label: '16', value: 16 }, { label: '24', value: 24 }, { label: '32', value: 32 }, { label: '48', value: 48 }];
  selectedLineSpacing = '1.15';
  selectedParagraphSpacing = 8;
  selectedPageMargin = 32;
  commands = new DocumentEditorCommands({
    getEditor: () => this.editorRef?.nativeElement ?? null,
    getParagraphSpacing: () => this.selectedParagraphSpacing,
    getLineSpacing: () => this.selectedLineSpacing,
    getPageMargin: () => this.selectedPageMargin,
    setHtml: (html) => {
      this.draftHtml = html;
    },
    markDirty: () => {
      this.isDraftDirty = true;
    },
    scheduleAutosave: () => this.scheduleAutosave(),
  });
  ngOnInit() {
    if (this.canEdit && this.docId) {
      this.loadDraft();
    }
    this.autosaveIntervalHandle = setInterval(() => {
      if (this.isDraftDirty && !this.isAutosaving) {
        this.saveDraft(true);
      }
    }, 8000);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialContent']) {
      this.setDraftText(this.initialContent);
    }
  }
  ngOnDestroy() {
    if (this.autosaveHandle) {
      clearTimeout(this.autosaveHandle);
    }
    if (this.autosaveIntervalHandle) {
      clearInterval(this.autosaveIntervalHandle);
    }
  }
  loadDraft() {
    if (!this.docId) {
      return;
    }
    this.http.get<ApiResponse<DraftResponse>>(`${this.apiBase}/documents/${this.docId}/draft`).subscribe({
      next: (response) => {
        this.draftContent = response.data?.content ?? null;
        this.draftError = '';
        if (this.draftContent) {
          this.setDraftText(this.draftContent);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.draftContent = null;
        this.draftError = formatHttpError(error, 'No se pudo cargar el borrador.');
      },
    });
  }
  setDraftText(content: Record<string, unknown> | null) {
    if (this.isDraftDirty) {
      return;
    }
    this.draftHtml = resolveContentHtmlValue(content);
    this.syncEditorContent();
  }
  onEditorInput(event: Event) {
    const target = event.target as HTMLDivElement | null;
    if (!target) {
      return;
    }
    this.commands.applyParagraphSpacing(true);
    this.draftHtml = target.innerHTML;
    this.isDraftDirty = true;
    this.scheduleAutosave();
  }
  onEditorKeydown(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      this.commands.applyFormat('bold');
    }
    if (key === 'i') {
      event.preventDefault();
      this.commands.applyFormat('italic');
    }
    if (key === 'u') {
      event.preventDefault();
      this.commands.applyFormat('underline');
    }
  }
  scheduleAutosave() {
    if (this.autosaveHandle) {
      clearTimeout(this.autosaveHandle);
    }
    this.autosaveHandle = setTimeout(() => {
      if (this.isDraftDirty) {
        this.saveDraft(true);
      }
    }, 1500);
  }
  setFontName(font: string) {
    this.selectedFont = font;
    this.commands.setFontName(font);
  }
  setFontSize(size: string) {
    this.selectedFontSize = size;
    this.commands.setFontSize(size);
  }
  setLineSpacing(value: string) {
    this.selectedLineSpacing = value;
    this.commands.setLineSpacing(value);
  }
  setPageMargin(value: number) {
    this.selectedPageMargin = value;
    this.commands.setPageMargin(value);
  }
  setParagraphSpacing(value: number) {
    this.selectedParagraphSpacing = value;
    this.commands.applyParagraphSpacing(false);
  }
  saveDraft(isAuto = false, onSuccess?: () => void, onError?: () => void) {
    this.draftSaveStatus = '';
    this.draftSaveError = '';
    if (!this.draftHtml.trim()) {
      this.draftSaveError = 'El borrador está vacío.';
      return;
    }
    const content = serializeDraftContent(this.draftHtml);
    this.isAutosaving = isAuto;
    this.http.put<ApiResponse<{ id: string }>>(`${this.apiBase}/documents/${this.docId}/draft`, { content }).subscribe({
      next: () => {
        this.draftSaveStatus = isAuto ? 'Guardado automático.' : 'Borrador guardado.';
        this.isDraftDirty = false;
        this.isAutosaving = false;
        this.loadDraft();
        onSuccess?.();
      },
      error: () => {
        this.draftSaveError = 'No se pudo guardar el borrador.';
        this.isAutosaving = false;
        onError?.();
      },
    });
  }
  syncEditorContent() {
    if (this.isDraftDirty) {
      return;
    }
    this.commands.syncEditorContent(this.draftHtml);
  }
}
