import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  password = '';
  confirm = '';

  reset() {
    const password = this.password.trim();
    const confirm = this.confirm.trim();
    if (!password || !confirm) {
      alert('Completa las contraseñas.');
      return;
    }
    if (password !== confirm) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      alert('Token inválido.');
      return;
    }

    this.http
      .post<{ success: boolean; data: { reset: boolean } }>(`${this.apiBase}/auth/reset-password`, {
        token,
        newPassword: password,
      })
      .subscribe({
        next: () => {
          alert('Contraseña actualizada.');
          this.router.navigateByUrl('/login');
        },
        error: () => {
          alert('No se pudo actualizar la contraseña.');
        },
      });
  }
}
