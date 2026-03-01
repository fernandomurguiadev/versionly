import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './forgot-password.page.html',
})
export class ForgotPasswordPage {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  email = '';

  requestReset() {
    const email = this.email.trim();
    if (!email) {
      alert('Ingresa tu email.');
      return;
    }

    this.http
      .post<{ success: boolean; data: { requested: boolean } }>(`${this.apiBase}/auth/forgot-password`, { email })
      .subscribe({
        next: () => {
          alert('Si el email existe, enviamos un enlace.');
        },
        error: () => {
          alert('No se pudo solicitar el reset.');
        },
      });
  }
}
