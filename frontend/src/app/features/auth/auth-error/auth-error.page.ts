import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-error-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-error.page.html',
})
export class AuthErrorPage {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = 'http://localhost:3000/api/v1';

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
          this.router.navigateByUrl('/verify');
        },
        error: () => {
          alert('No se pudo reenviar la verificación.');
        },
      });
  }
}
