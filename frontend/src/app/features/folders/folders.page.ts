import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

type FolderListItem = {
  id: string;
  name: string;
  documentCount: number;
  updatedAt: string;
};

type FolderCard = {
  id: string;
  name: string;
  documentCount: number;
  updatedAt: string;
};

type ProjectDetail = {
  id: string;
  workspaceId: string;
  name: string;
  folderCount: number;
};

type WorkspaceDetail = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-folders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './folders.page.html',
})
export class FoldersPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/v1';
  projectId = this.route.snapshot.paramMap.get('projectId') ?? '';
  projectName = '';
  workspaceId = '';
  workspaceName = '';

  folders: FolderCard[] = [];
  isFolderModalOpen = false;
  folderName = '';

  ngOnInit() {
    this.loadProject();
    this.loadFolders();
  }

  loadProject() {
    if (!this.projectId) {
      return;
    }

    this.http.get<ApiResponse<ProjectDetail>>(`${this.apiBase}/projects/${this.projectId}`).subscribe({
      next: (response) => {
        this.projectName = response.data.name;
        this.workspaceId = response.data.workspaceId;
        this.loadWorkspace();
      },
      error: () => {
        this.projectName = this.projectId;
      },
    });
  }

  loadWorkspace() {
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

  loadFolders() {
    if (!this.projectId) {
      return;
    }

    this.http
      .get<ApiResponse<PaginatedResponse<FolderListItem>>>(`${this.apiBase}/projects/${this.projectId}/folders`)
      .subscribe({
        next: (response) => {
          this.folders = response.data.data.map((folder) => ({
            id: folder.id,
            name: folder.name,
            documentCount: folder.documentCount,
            updatedAt: folder.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          }));
        },
        error: () => {
          this.folders = [];
        },
      });
  }

  openFolderModal() {
    this.folderName = '';
    this.isFolderModalOpen = true;
  }

  closeFolderModal() {
    this.isFolderModalOpen = false;
  }

  submitFolder() {
    const trimmed = this.folderName.trim();
    if (!trimmed || !this.projectId) {
      return;
    }

    this.http
      .post<ApiResponse<{ id: string; name: string }>>(`${this.apiBase}/projects/${this.projectId}/folders`, {
        name: trimmed,
      })
      .subscribe({
        next: () => {
          this.loadFolders();
          this.isFolderModalOpen = false;
        },
        error: () => {
          alert('No se pudo crear la carpeta. Verifica sesión y backend.');
        },
      });
  }
}
