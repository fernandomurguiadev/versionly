import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DocumentDiffPanelComponent } from './document-diff-panel.component';
import { DocumentEditorPanelComponent } from './document-editor-panel.component';
import {
  ApiResponse,
  DocumentContentResponse,
  DocumentDetail,
  FolderDetail,
  PaginatedResponse,
  ProjectDetail,
  VersionItem,
  WorkspaceDetail,
} from './document-detail.models';
import { formatHttpError, resolveContentHtmlValue } from './document-detail.utils';
@Component({
  selector: 'app-document-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DocumentEditorPanelComponent, DocumentDiffPanelComponent],
  templateUrl: './document-detail.page.html',
})
export class DocumentDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly apiBase = 'http://localhost:3000/api/v1';
  docId = this.route.snapshot.paramMap.get('docId') ?? '';
  document: DocumentDetail | null = null;
  documentError = '';
  versions: VersionItem[] = [];
  versionsError = '';
  content: Record<string, unknown> | null = null;
  contentVersionLabel = '';
  contentError = '';
  contentHtml: SafeHtml | null = null;
  versionName = '';
  versionComment = '';
  versionMarkAsCurrent = true;
  versionSaveError = '';
  versionSaveStatus = '';
  folderName = '';
  projectId = '';
  projectName = '';
  workspaceId = '';
  workspaceName = '';
  @ViewChild(DocumentEditorPanelComponent) editorPanel?: DocumentEditorPanelComponent;
  ngOnInit() {
    if (!this.docId) {
      return;
    }
    this.loadDocument();
  }
  retryLoad() {
    if (!this.docId) {
      return;
    }
    this.loadDocument();
  }
  loadDocument() {
    this.documentError = '';
    this.http.get<ApiResponse<DocumentDetail>>(`${this.apiBase}/documents/${this.docId}`).subscribe({
      next: (response) => {
        this.document = response.data;
        this.loadContent();
        this.loadFolderMeta(response.data.folderId);
        this.loadVersions();
      },
      error: (error: HttpErrorResponse) => {
        this.document = null;
        this.documentError = formatHttpError(error, 'No se pudo cargar el documento.');
      },
    });
  }
  loadContent() {
    this.contentError = '';
    this.contentHtml = null;
    this.contentVersionLabel = '';
    this.http.get<ApiResponse<DocumentContentResponse>>(`${this.apiBase}/documents/${this.docId}/content`).subscribe({
      next: (response) => {
        this.content = response.data.content;
        this.contentVersionLabel = response.data.currentVersion ? response.data.currentVersion.name : 'Sin versión actual';
        const htmlContent = resolveContentHtmlValue(response.data.content);
        this.contentHtml = htmlContent ? this.sanitizer.bypassSecurityTrustHtml(htmlContent) : null;
      },
      error: (error: HttpErrorResponse) => {
        this.content = null;
        this.contentError = formatHttpError(error, 'No se pudo cargar el contenido.');
      },
    });
  }
  loadVersions() {
    this.versionsError = '';
    this.http.get<ApiResponse<PaginatedResponse<VersionItem>>>(`${this.apiBase}/documents/${this.docId}/versions?limit=50`).subscribe({
      next: (response) => {
        this.versions = response.data.data;
      },
      error: (error: HttpErrorResponse) => {
        this.versions = [];
        this.versionsError = formatHttpError(error, 'No se pudo cargar el historial de versiones.');
      },
    });
  }
  loadFolderMeta(folderId: string) {
    if (!folderId) {
      return;
    }
    this.http.get<ApiResponse<FolderDetail>>(`${this.apiBase}/folders/${folderId}`).subscribe({
      next: (response) => {
        this.folderName = response.data.name;
        this.projectId = response.data.projectId;
        this.loadProjectMeta();
      },
      error: () => {
        this.folderName = folderId;
      },
    });
  }
  loadProjectMeta() {
    if (!this.projectId) {
      return;
    }
    this.http.get<ApiResponse<ProjectDetail>>(`${this.apiBase}/projects/${this.projectId}`).subscribe({
      next: (response) => {
        this.projectName = response.data.name;
        this.workspaceId = response.data.workspaceId;
        this.loadWorkspaceMeta();
      },
      error: () => {
        this.projectName = this.projectId;
      },
    });
  }
  loadWorkspaceMeta() {
    if (!this.workspaceId) {
      return;
    }
    this.http.get<ApiResponse<WorkspaceDetail>>(`${this.apiBase}/workspaces/${this.workspaceId}`).subscribe({
      next: (response) => {
        this.workspaceName = response.data.name;
      },
      error: () => {
        this.workspaceName = this.workspaceId;
      },
    });
  }
  createVersion() {
    this.versionSaveStatus = '';
    this.versionSaveError = '';
    if (!this.versionName.trim()) {
      this.versionSaveError = 'Nombre de versión obligatorio.';
      return;
    }
    if (this.editorPanel?.isDraftDirty) {
      this.editorPanel.saveDraft(false, () => this.persistVersion(), () => {
        this.versionSaveError = 'No se pudo guardar el borrador.';
      });
      return;
    }
    this.persistVersion();
  }
  private persistVersion() {
    const payload = {
      name: this.versionName.trim(),
      comment: this.versionComment.trim() || null,
      markAsCurrent: this.versionMarkAsCurrent,
    };
    this.http.post<ApiResponse<VersionItem>>(`${this.apiBase}/documents/${this.docId}/versions`, payload).subscribe({
      next: () => {
        this.versionSaveStatus = 'Versión creada.';
        this.versionName = '';
        this.versionComment = '';
        this.versionMarkAsCurrent = true;
        this.loadVersions();
        this.loadContent();
      },
      error: (error: HttpErrorResponse) => {
        this.versionSaveError = formatHttpError(error, 'No se pudo crear la versión.');
      },
    });
  }
  setCurrentVersion(versionId: string) {
    this.http.post<ApiResponse<{ updated: boolean }>>(`${this.apiBase}/versions/${versionId}/set-current`, {}).subscribe({
      next: () => {
        this.loadContent();
        this.loadVersions();
      },
      error: (error: HttpErrorResponse) => {
        this.versionsError = formatHttpError(error, 'No se pudo marcar como actual.');
      },
    });
  }
}
