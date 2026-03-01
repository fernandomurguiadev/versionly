import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  email = '';
  password = '';

  login() {
    const email = this.email.trim();
    const password = this.password.trim();
    if (!email || !password) {
      alert('Completa email y contraseña.');
      return;
    }

    this.http
      .post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(`${this.apiBase}/auth/login`, {
        email,
        password,
      })
      .subscribe({
        next: (response) => {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          this.router.navigateByUrl('/app');
        },
        error: () => {
          alert('No se pudo iniciar sesión. Revisa credenciales y verificación.');
        },
      });
  }
}
