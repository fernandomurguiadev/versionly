import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = 'http://localhost:3000/api/v1';

  fullName = '';
  email = '';
  password = '';

  register() {
    const fullName = this.fullName.trim();
    const email = this.email.trim();
    const password = this.password.trim();
    if (!fullName || !email || !password) {
      alert('Completa todos los campos.');
      return;
    }
    const isValidPassword = password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d).+$/.test(password);
    if (!isValidPassword) {
      alert('La contraseña debe tener al menos 8 caracteres e incluir letras y números.');
      return;
    }

    this.http
      .post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
        `${this.apiBase}/auth/register`,
        {
          fullName,
          email,
          password,
        },
      )
      .subscribe({
        next: (response) => {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          this.router.navigateByUrl('/verify');
        },
        error: (error) => {
          const message = error?.error?.error?.message ?? 'No se pudo crear la cuenta.';
          alert(message);
        },
      });
  }
}
