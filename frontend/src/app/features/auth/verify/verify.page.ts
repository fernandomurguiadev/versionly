import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify.page.html',
})
export class VerifyPage {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  verify() {
    const token = prompt('Token de verificación');
    const trimmed = token?.trim();
    if (!trimmed) {
      return;
    }

    this.http
      .post<{ success: boolean; data: { verified: boolean } }>(`${this.apiBase}/auth/verify-email`, { token: trimmed })
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/verify/success');
        },
        error: () => {
          alert('Token inválido o expirado.');
        },
      });
  }

  resend() {
    const email = prompt('Email para reenviar verificación');
    const trimmed = email?.trim();
    if (!trimmed) {
      return;
    }

    this.http
      .post<{ success: boolean; data: { resent: boolean } }>(`${this.apiBase}/auth/resend-verification`, {
        email: trimmed,
      })
      .subscribe({
        next: () => {
          alert('Si el email existe, reenviamos la verificación.');
        },
        error: () => {
          alert('No se pudo reenviar la verificación.');
        },
      });
  }
}
