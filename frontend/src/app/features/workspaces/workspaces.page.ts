import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type WorkspaceCard = {
  id: string;
  name: string;
  updatedAt: string;
  projects: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

type WorkspaceListItem = {
  id: string;
  name: string;
  role: string;
  updatedAt: string;
};

@Component({
  selector: 'app-workspaces-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './workspaces.page.html',
})
export class WorkspacesPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  isWorkspaceModalOpen = false;
  workspaceName = '';

  workspaces: WorkspaceCard[] = [];

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.http.get<ApiResponse<PaginatedResponse<WorkspaceListItem>>>(`${this.apiBase}/workspaces`).subscribe({
      next: (response) => {
        this.workspaces = response.data.data.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          updatedAt: workspace.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          projects: 0,
        }));
      },
      error: () => {
        this.workspaces = [];
      },
    });
  }

  openWorkspaceModal() {
    this.workspaceName = '';
    this.isWorkspaceModalOpen = true;
  }

  closeWorkspaceModal() {
    this.isWorkspaceModalOpen = false;
  }

  submitWorkspace() {
    const trimmed = this.workspaceName.trim();
    if (!trimmed) {
      return;
    }

    this.http
      .post<ApiResponse<{ id: string; name: string; updatedAt: string }>>(`${this.apiBase}/workspaces`, {
        name: trimmed,
      })
      .subscribe({
        next: (response) => {
          const updatedAt = response.data.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
          this.workspaces = [
            { id: response.data.id, name: response.data.name, updatedAt, projects: 0 },
            ...this.workspaces,
          ];
          this.isWorkspaceModalOpen = false;
        },
        error: () => {
          alert('No se pudo crear el workspace. Verifica sesión y backend.');
        },
      });
  }
}
