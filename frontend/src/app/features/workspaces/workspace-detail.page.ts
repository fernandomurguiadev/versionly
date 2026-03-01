import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

type ProjectCard = {
  id: string;
  name: string;
  folders: number;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

type ProjectListItem = {
  id: string;
  workspaceId: string;
  name: string;
  folderCount: number;
  updatedAt: string;
};

type WorkspaceDetail = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-workspace-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './workspace-detail.page.html',
})
export class WorkspaceDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/v1';
  workspaceId = this.route.snapshot.paramMap.get('wsId') ?? 'workspace';
  workspaceName = '';

  isProjectModalOpen = false;
  projectName = '';

  isFolderModalOpen = false;
  folderName = '';
  selectedProjectId = '';
  selectedProjectName = '';

  isErrorModalOpen = false;
  errorTitle = '';
  errorMessage = '';

  projects: ProjectCard[] = [];

  ngOnInit() {
    this.loadWorkspace();
    this.loadProjects();
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

  loadProjects() {
    if (!this.workspaceId) {
      return;
    }

    this.http
      .get<ApiResponse<PaginatedResponse<ProjectListItem>>>(`${this.apiBase}/workspaces/${this.workspaceId}/projects`)
      .subscribe({
        next: (response) => {
          this.projects = response.data.data.map((project) => ({
            id: project.id,
            name: project.name,
            folders: project.folderCount,
            updatedAt: project.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          }));
        },
        error: () => {
          this.projects = [];
        },
      });
  }

  openProjectModal() {
    this.projectName = '';
    this.isProjectModalOpen = true;
  }

  closeProjectModal() {
    this.isProjectModalOpen = false;
  }

  submitProject() {
    const trimmed = this.projectName.trim();
    if (!trimmed) {
      return;
    }

    this.http
      .post<ApiResponse<{ id: string; name: string; createdAt?: string; updatedAt?: string }>>(
        `${this.apiBase}/workspaces/${this.workspaceId}/projects`,
        { name: trimmed },
      )
      .subscribe({
        next: (response) => {
          const updatedAt =
            response.data.updatedAt?.slice(0, 10) ??
            response.data.createdAt?.slice(0, 10) ??
            new Date().toISOString().slice(0, 10);
          this.loadProjects();
          this.isProjectModalOpen = false;
        },
        error: (error: HttpErrorResponse) => {
          this.openErrorModal('No se pudo crear el proyecto', this.formatHttpError(error, 'Verifica sesión y backend.'));
        },
      });
  }

  openFolderModal(projectId: string, projectName: string) {
    this.selectedProjectId = projectId;
    this.selectedProjectName = projectName;
    this.folderName = '';
    this.isFolderModalOpen = true;
  }

  closeFolderModal() {
    this.isFolderModalOpen = false;
  }

  submitFolder() {
    const trimmed = this.folderName.trim();
    if (!trimmed || !this.selectedProjectId) {
      return;
    }

    this.http
      .post<ApiResponse<{ id: string; name: string }>>(
        `${this.apiBase}/projects/${this.selectedProjectId}/folders`,
        { name: trimmed },
      )
      .subscribe({
        next: () => {
          this.loadProjects();
          this.isFolderModalOpen = false;
        },
        error: (error: HttpErrorResponse) => {
          this.openErrorModal('No se pudo crear la carpeta', this.formatHttpError(error, 'Verifica sesión y backend.'));
        },
      });
  }

  openErrorModal(title: string, message: string) {
    this.errorTitle = title;
    this.errorMessage = message;
    this.isErrorModalOpen = true;
  }

  closeErrorModal() {
    this.isErrorModalOpen = false;
  }

  formatHttpError(error: HttpErrorResponse, fallback: string) {
    const tokenPresent = Boolean(localStorage.getItem('accessToken'));
    const apiMessage =
      (error.error as { error?: { message?: string } } | null)?.error?.message ||
      (error.error as { message?: string } | null)?.message ||
      fallback;
    const statusLabel = error.status ? `HTTP ${error.status}` : '';
    const tokenLabel = `Token ${tokenPresent ? 'presente' : 'ausente'}`;
    return [apiMessage, statusLabel, tokenLabel].filter(Boolean).join(' · ');
  }
}
