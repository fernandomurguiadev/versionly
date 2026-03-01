import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type DocumentCard = {
  id: string;
  title: string;
  updatedAt: string;
  status: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

type DocumentListItem = {
  id: string;
  title: string;
  updatedAt: string;
  currentVersion: { id: string; name: string; createdAt: string } | null;
};

type FolderDetail = {
  id: string;
  projectId: string;
  name: string;
  documentCount: number;
};

type ProjectDetail = {
  id: string;
  workspaceId: string;
  name: string;
};

type WorkspaceDetail = {
  id: string;
  name: string;
};

type FolderOption = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './documents.page.html',
})
export class DocumentsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = 'http://localhost:3000/api/v1';
  folderId = this.route.snapshot.paramMap.get('folderId') ?? 'folder';
  folderName = '';
  projectId = '';
  projectName = '';
  workspaceId = '';
  workspaceName = '';
  documentCount = 0;

  isDocumentModalOpen = false;
  documentTitle = '';

  isActionModalOpen = false;
  actionMode: 'rename' | 'move' | 'delete' = 'rename';
  selectedDocument: DocumentCard | null = null;
  renameTitle = '';
  moveFolderId = '';
  moveFolders: FolderOption[] = [];
  actionError = '';
  actionStatus = '';
  isMoveLoading = false;

  documents: DocumentCard[] = [];

  ngOnInit() {
    this.loadFolderMeta();
    this.loadDocuments();
  }

  loadFolderMeta() {
    if (!this.folderId) {
      return;
    }

    this.http.get<ApiResponse<FolderDetail>>(`${this.apiBase}/folders/${this.folderId}`).subscribe({
      next: (response) => {
        this.folderName = response.data.name;
        this.projectId = response.data.projectId;
        this.documentCount = response.data.documentCount;
        this.loadProjectMeta();
      },
      error: () => {
        this.folderName = this.folderId;
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

  loadDocuments() {
    if (!this.folderId) {
      return;
    }

    this.http
      .get<ApiResponse<PaginatedResponse<DocumentListItem>>>(`${this.apiBase}/folders/${this.folderId}/documents`)
      .subscribe({
        next: (response) => {
          this.documents = response.data.data.map((doc) => ({
            id: doc.id,
            title: doc.title,
            updatedAt: doc.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            status: doc.currentVersion ? 'Versión actual' : 'Borrador activo',
          }));
        },
        error: () => {
          this.documents = [];
        },
      });
  }

  openDocumentModal() {
    this.documentTitle = '';
    this.isDocumentModalOpen = true;
  }

  closeDocumentModal() {
    this.isDocumentModalOpen = false;
  }

  submitDocument() {
    const trimmed = this.documentTitle.trim();
    if (!trimmed) {
      return;
    }

    this.http
      .post<ApiResponse<{ id: string; title: string; updatedAt?: string; createdAt?: string }>>(
        `${this.apiBase}/folders/${this.folderId}/documents`,
        { title: trimmed },
      )
      .subscribe({
        next: (response) => {
          const updatedAt =
            response.data.updatedAt?.slice(0, 10) ??
            response.data.createdAt?.slice(0, 10) ??
            new Date().toISOString().slice(0, 10);
          this.isDocumentModalOpen = false;
          this.router.navigate(['/app/documents', response.data.id]);
        },
        error: () => {
          alert('No se pudo crear el documento. Verifica sesión y backend.');
        },
      });
  }

  openActionModal(doc: DocumentCard, mode: 'rename' | 'move' | 'delete') {
    this.selectedDocument = doc;
    this.actionMode = mode;
    this.actionError = '';
    this.actionStatus = '';
    this.renameTitle = doc.title;
    this.moveFolderId = this.folderId;
    if (mode === 'move') {
      this.loadMoveFolders();
    }
    this.isActionModalOpen = true;
  }

  closeActionModal() {
    this.isActionModalOpen = false;
  }

  loadMoveFolders() {
    if (!this.projectId) {
      return;
    }
    this.isMoveLoading = true;
    this.http
      .get<ApiResponse<PaginatedResponse<{ id: string; name: string }>>>(
        `${this.apiBase}/projects/${this.projectId}/folders`,
      )
      .subscribe({
        next: (response) => {
          this.moveFolders = response.data.data.map((folder) => ({ id: folder.id, name: folder.name }));
          this.isMoveLoading = false;
        },
        error: () => {
          this.moveFolders = [];
          this.isMoveLoading = false;
          this.actionError = 'No se pudo cargar las carpetas.';
        },
      });
  }

  submitRename() {
    if (!this.selectedDocument) {
      return;
    }
    const trimmed = this.renameTitle.trim();
    if (!trimmed) {
      this.actionError = 'Ingresa un título válido.';
      return;
    }
    this.http
      .patch<ApiResponse<{ id: string; title: string }>>(`${this.apiBase}/documents/${this.selectedDocument.id}`, {
        title: trimmed,
      })
      .subscribe({
        next: () => {
          this.documents = this.documents.map((doc) =>
            doc.id === this.selectedDocument?.id ? { ...doc, title: trimmed } : doc,
          );
          this.actionStatus = 'Documento actualizado.';
          this.isActionModalOpen = false;
        },
        error: () => {
          this.actionError = 'No se pudo renombrar el documento.';
        },
      });
  }

  submitMove() {
    if (!this.selectedDocument) {
      return;
    }
    if (!this.moveFolderId) {
      this.actionError = 'Selecciona una carpeta destino.';
      return;
    }
    this.http
      .patch<ApiResponse<{ moved: boolean }>>(`${this.apiBase}/documents/${this.selectedDocument.id}/move`, {
        folderId: this.moveFolderId,
      })
      .subscribe({
        next: () => {
          this.actionStatus = 'Documento movido.';
          this.isActionModalOpen = false;
          this.loadDocuments();
        },
        error: () => {
          this.actionError = 'No se pudo mover el documento.';
        },
      });
  }

  submitDelete() {
    if (!this.selectedDocument) {
      return;
    }
    this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.apiBase}/documents/${this.selectedDocument.id}`).subscribe({
      next: () => {
        this.documents = this.documents.filter((doc) => doc.id !== this.selectedDocument?.id);
        this.actionStatus = 'Documento eliminado.';
        this.isActionModalOpen = false;
      },
      error: () => {
        this.actionError = 'No se pudo eliminar el documento.';
      },
    });
  }
}
