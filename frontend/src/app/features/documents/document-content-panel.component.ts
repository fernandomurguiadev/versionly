import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-document-content-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-content-panel.component.html',
})
export class DocumentContentPanelComponent {
  @Input() contentHtml: SafeHtml | null = null;
  @Input() content: Record<string, unknown> | null = null;
  @Input() contentError = '';
  @Input() contentVersionLabel = '';
}
