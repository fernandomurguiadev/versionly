import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiResponse, DiffChange, DiffSummary, VersionItem } from './document-detail.models';
import { formatHttpError } from './document-detail.utils';

@Component({
  selector: 'app-document-diff-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-diff-panel.component.html',
})
export class DocumentDiffPanelComponent implements OnChanges {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  @Input() docId = '';
  @Input() versions: VersionItem[] = [];

  selectedVersionA = '';
  selectedVersionB = '';
  diffSummary: DiffSummary | null = null;
  diffChanges: DiffChange[] | null = null;
  diffError = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['versions']) {
      if (!this.selectedVersionA && this.versions[0]) {
        this.selectedVersionA = this.versions[0].id;
      }
      if (!this.selectedVersionB && this.versions[1]) {
        this.selectedVersionB = this.versions[1].id;
      }
    }
  }

  compareVersions() {
    this.diffError = '';
    this.diffSummary = null;
    this.diffChanges = null;
    if (!this.selectedVersionA || !this.selectedVersionB) {
      this.diffError = 'Selecciona dos versiones.';
      return;
    }
    if (this.selectedVersionA === this.selectedVersionB) {
      this.diffError = 'Selecciona versiones distintas.';
      return;
    }
    this.http
      .get<ApiResponse<{ summary: DiffSummary; changes: DiffChange[] }>>(
        `${this.apiBase}/diff?versionA=${this.selectedVersionA}&versionB=${this.selectedVersionB}`,
      )
      .subscribe({
        next: (response) => {
          this.diffSummary = response.data.summary;
          this.diffChanges = response.data.changes;
        },
        error: (error: HttpErrorResponse) => {
          this.diffError = formatHttpError(error, 'No se pudo comparar las versiones.');
        },
      });
  }
}
