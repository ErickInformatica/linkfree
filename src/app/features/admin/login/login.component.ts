import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="scene">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <div class="card">
        <div class="brand">
          <span class="brand-icon">✦</span>
          <span class="brand-name">Linkfree</span>
        </div>
        <h1>Bienvenido</h1>
        <p class="sub">Accede para gestionar tus perfiles</p>

        <button class="google-btn" (click)="login()" [disabled]="loading">
          @if (loading) {
            <span class="spinner"></span>
            <span>Entrando...</span>
          } @else {
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            <span>Continuar con Google</span>
          }
        </button>

        @if (error) {
          <p class="error">{{ error }}</p>
        }

        <p class="hint">Solo los administradores autorizados pueden acceder.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { --v: #7c3aed; --c: #06b6d4; --r: #f43f5e; }

    .scene {
      min-height: 100vh;
      background: #07071a;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      position: relative; overflow: hidden;
    }

    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(90px); pointer-events: none;
      will-change: transform;
    }
    .orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%);
      top: -150px; left: -150px;
      animation: d1 16s ease-in-out infinite alternate;
    }
    .orb-2 {
      width: 420px; height: 420px;
      background: radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%);
      bottom: -120px; right: -100px;
      animation: d2 20s ease-in-out infinite alternate;
    }
    .orb-3 {
      width: 280px; height: 280px;
      background: radial-gradient(circle, rgba(244,63,94,0.25) 0%, transparent 70%);
      top: 40%; left: 55%;
      animation: d3 24s ease-in-out infinite alternate;
    }
    @keyframes d1 { to { transform: translate(50px, 40px) scale(1.1); } }
    @keyframes d2 { to { transform: translate(-40px, -30px) scale(1.15); } }
    @keyframes d3 { to { transform: translate(-50px, 60px) scale(0.9); } }

    .card {
      position: relative; z-index: 1;
      width: 100%; max-width: 380px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 48px 40px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.4);
      animation: up 0.6s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes up { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform:none; } }

    .brand {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 28px;
      font-size: 1.1rem; font-weight: 700;
      color: white;
    }
    .brand-icon {
      font-size: 1.3rem;
      background: linear-gradient(135deg, var(--v), var(--c));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 1.75rem; font-weight: 700;
      color: white;
    }
    .sub { margin: 0 0 32px; color: rgba(255,255,255,0.45); font-size: 0.9rem; }

    .google-btn {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 14px;
      background: white;
      color: #333;
      border: none; border-radius: 12px;
      font-size: 0.95rem; font-weight: 500;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    }
    .google-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(124,58,237,0.3);
    }
    .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid #ddd; border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error { margin-top: 12px; color: #f43f5e; font-size: 0.85rem; text-align: center; }
    .hint { margin-top: 20px; color: rgba(255,255,255,0.25); font-size: 0.78rem; text-align: center; }
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
