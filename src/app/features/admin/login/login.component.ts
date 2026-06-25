import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <div class="logo">🔗 Linkfree</div>
        <h1>Admin Panel</h1>
        <p>Accede con tu cuenta de Google</p>
        <button (click)="login()" [disabled]="loading">
          @if (loading) { Entrando... } @else { Entrar con Google }
        </button>
        @if (error) { <p class="error">{{ error }}</p> }
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      text-align: center;
      width: 340px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .logo { font-size: 2rem; margin-bottom: 8px; }
    h1 { margin: 0 0 8px; color: #333; font-size: 1.5rem; }
    p { color: #666; margin: 0 0 24px; }
    button {
      width: 100%;
      padding: 14px;
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover:not(:disabled) { background: #3367d6; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #e53e3e; margin-top: 12px; font-size: 0.875rem; }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  loading = false;
  error = '';

  async login() {
    this.loading = true;
    this.error = '';
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/admin']);
    } catch (e: any) {
      this.error = e.message ?? 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
