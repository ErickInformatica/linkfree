import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="dashboard">
      <header>
        <div class="brand">🔗 Linkfree</div>
        <div class="user-info">
          <img [src]="authService.currentUser()?.photoURL || ''" alt="avatar" class="avatar" />
          <span>{{ authService.currentUser()?.displayName }}</span>
          <button (click)="logout()" class="btn-ghost">Salir</button>
        </div>
      </header>

      <main>
        <div class="top-bar">
          <h1>Mis perfiles</h1>
          <button (click)="showCreate = true" class="btn-primary">+ Nuevo perfil</button>
        </div>

        @if (showCreate) {
          <div class="create-card">
            <h3>Nuevo perfil</h3>
            <input [(ngModel)]="newName" placeholder="Nombre (ej: Clínica Santa Ana)" class="input" />
            <input [(ngModel)]="newSlug" placeholder="Slug URL (ej: clinica)" class="input" />
            <p class="hint">URL pública: linkfree-erick.web.app/<strong>{{ newSlug || 'slug' }}</strong></p>
            <div class="actions">
              <button (click)="createProfile()" class="btn-primary" [disabled]="creating">
                @if (creating) { Creando... } @else { Crear }
              </button>
              <button (click)="showCreate = false" class="btn-ghost">Cancelar</button>
            </div>
            @if (createError) { <p class="error">{{ createError }}</p> }
          </div>
        }

        @if (loading()) {
          <p class="loading">Cargando perfiles...</p>
        } @else if (profiles().length === 0) {
          <div class="empty">
            <p>No tienes perfiles aún.</p>
            <button (click)="showCreate = true" class="btn-primary">Crear primer perfil</button>
          </div>
        } @else {
          <div class="profiles-grid">
            @for (p of profiles(); track p.info.slug) {
              <div class="profile-card">
                @if (p.info.avatarUrl) {
                  <img [src]="p.info.avatarUrl" alt="avatar" class="profile-avatar" />
                } @else {
                  <div class="profile-avatar-placeholder">{{ p.info.name[0] }}</div>
                }
                <div class="profile-info">
                  <h3>{{ p.info.name }}</h3>
                  <p class="slug">linkfree-erick.web.app/<strong>{{ p.info.slug }}</strong></p>
                  <div class="stats-mini">
                    <span>👁 {{ p.stats.totalViews }} vistas</span>
                    <span>🖱 {{ p.stats.totalClicks }} clicks</span>
                    <span>🔗 {{ p.links.length }} links</span>
                  </div>
                </div>
                <div class="profile-actions">
                  <a [routerLink]="['/admin/profile', p.info.slug]" class="btn-primary">Editar</a>
                  <a [routerLink]="['/admin/stats', p.info.slug]" class="btn-ghost">Stats</a>
                  <a [href]="'/' + p.info.slug" target="_blank" class="btn-ghost">Ver →</a>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .dashboard { min-height: 100vh; background: #f7f8fa; font-family: Inter, sans-serif; }
    header {
      background: white;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .brand { font-size: 1.5rem; font-weight: 700; color: #764ba2; }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; }
    main { max-width: 900px; margin: 0 auto; padding: 32px 16px; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    h1 { font-size: 1.75rem; font-weight: 700; color: #1a202c; margin: 0; }
    .create-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      margin-bottom: 12px;
      box-sizing: border-box;
    }
    .hint { font-size: 0.85rem; color: #666; margin: -4px 0 12px; }
    .actions { display: flex; gap: 8px; }
    .profiles-grid { display: flex; flex-direction: column; gap: 16px; }
    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s;
    }
    .profile-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .profile-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
    .profile-avatar-placeholder {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; font-size: 1.5rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .profile-info { flex: 1; }
    .profile-info h3 { margin: 0 0 4px; font-size: 1.1rem; color: #1a202c; }
    .slug { margin: 0 0 8px; font-size: 0.85rem; color: #666; }
    .stats-mini { display: flex; gap: 12px; font-size: 0.8rem; color: #888; }
    .profile-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .empty { text-align: center; padding: 48px; color: #666; }
    .loading { text-align: center; padding: 48px; color: #888; }
    .btn-primary {
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; border: none; border-radius: 8px;
      font-size: 0.9rem; cursor: pointer; text-decoration: none;
      display: inline-block; transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost {
      padding: 8px 16px;
      background: transparent; color: #555;
      border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.9rem; cursor: pointer; text-decoration: none;
      display: inline-block; transition: background 0.2s;
    }
    .btn-ghost:hover { background: #f7f8fa; }
    .error { color: #e53e3e; font-size: 0.875rem; margin-top: 8px; }
  `],
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  profiles = signal<Profile[]>([]);
  loading = signal(true);
  showCreate = false;
  newName = '';
  newSlug = '';
  creating = false;
  createError = '';

  ngOnInit() {
    this.loadProfiles();
  }

  async loadProfiles() {
    this.loading.set(true);
    try {
      this.profiles.set(await this.profileService.getMyProfiles());
    } finally {
      this.loading.set(false);
    }
  }

  async createProfile() {
    if (!this.newName || !this.newSlug) return;
    this.creating = true;
    this.createError = '';
    try {
      await this.profileService.createProfile(this.newSlug.toLowerCase(), this.newName);
      this.showCreate = false;
      this.newName = '';
      this.newSlug = '';
      await this.loadProfiles();
    } catch (e: any) {
      this.createError = e.message ?? 'Error al crear perfil';
    } finally {
      this.creating = false;
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
