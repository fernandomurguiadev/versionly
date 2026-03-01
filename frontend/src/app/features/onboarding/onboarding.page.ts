import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './onboarding.page.html',
})
export class OnboardingPage {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  step = 1;
  workspaceName = '';
  projectName = '';
  folderName = '';
  workspaceId = '';
  projectId = '';
  folderId = '';
  errorMessage = '';

  nextFromWorkspace() {
    const trimmed = this.workspaceName.trim();
    if (!trimmed) {
      this.errorMessage = 'Ingresa un nombre de workspace.';
      return;
    }
    this.http.post<ApiResponse<{ id: string }>>(`${this.apiBase}/workspaces`, { name: trimmed }).subscribe({
      next: (response) => {
        this.workspaceId = response.data.id;
        this.errorMessage = '';
        this.step = 2;
      },
      error: () => {
        this.errorMessage = 'No se pudo crear el workspace.';
      },
    });
  }

  nextFromProject() {
    const trimmed = this.projectName.trim();
    if (!trimmed || !this.workspaceId) {
      this.errorMessage = 'Ingresa un nombre de proyecto.';
      return;
    }
    this.http
      .post<ApiResponse<{ id: string }>>(`${this.apiBase}/workspaces/${this.workspaceId}/projects`, { name: trimmed })
      .subscribe({
        next: (response) => {
          this.projectId = response.data.id;
          this.errorMessage = '';
          this.step = 3;
        },
        error: () => {
          this.errorMessage = 'No se pudo crear el proyecto.';
        },
      });
  }

  nextFromFolder() {
    const trimmed = this.folderName.trim();
    if (!trimmed || !this.projectId) {
      this.errorMessage = 'Ingresa un nombre de carpeta.';
      return;
    }
    this.http
      .post<ApiResponse<{ id: string }>>(`${this.apiBase}/projects/${this.projectId}/folders`, { name: trimmed })
      .subscribe({
        next: (response) => {
          this.folderId = response.data.id;
          this.errorMessage = '';
          this.step = 4;
        },
        error: () => {
          this.errorMessage = 'No se pudo crear la carpeta.';
        },
      });
  }

  skipToApp() {
    this.router.navigateByUrl('/app');
  }

  goToDocuments() {
    if (!this.folderId) {
      this.router.navigateByUrl('/app');
      return;
    }
    this.router.navigate(['/app/folders', this.folderId, 'documents']);
  }

  back() {
    this.errorMessage = '';
    this.step = Math.max(1, this.step - 1);
  }
}
