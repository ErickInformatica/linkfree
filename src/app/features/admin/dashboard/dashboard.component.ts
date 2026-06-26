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
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-icon">✦</span>
          <span>Linkfree</span>
        </div>
        <nav class="nav">
          <a class="nav-item active" [routerLink]="['/admin']">
            <span>◈</span> Perfiles
          </a>
        </nav>
        <div class="sidebar-user">
          <img [src]="authService.currentUser()?.photoURL || ''" alt="" class="u-avatar" />
          <span class="u-name">{{ firstName() }}</span>
          <button (click)="logout()" class="u-logout" title="Salir">⎋</button>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <header class="topbar">
          <div>
            <h1>Mis perfiles</h1>
            <p class="sub">{{ profiles().length }} perfil{{ profiles().length !== 1 ? 'es' : '' }}</p>
          </div>
          <button (click)="showCreate = !showCreate" class="btn-create">
            + Nuevo perfil
          </button>
        </header>

        <!-- Create form -->
        @if (showCreate) {
          <div class="create-panel">
            <h3>Crear perfil</h3>
            <div class="create-row">
              <input [(ngModel)]="newName" placeholder="Nombre" class="inp" />
              <input [(ngModel)]="newSlug" placeholder="slug-url" class="inp" (ngModelChange)="newSlug = $event.toLowerCase().replace(' ', '-')" />
              <button (click)="createProfile()" class="btn-primary" [disabled]="creating || !newName || !newSlug">
                @if (creating) { ... } @else { Crear }
              </button>
            </div>
            <p class="slug-hint">URL: <strong>linkfree-erick.web.app/{{ newSlug || 'slug' }}</strong></p>
            @if (createError) { <p class="err">{{ createError }}</p> }
          </div>
        }

        <!-- Profiles grid -->
        @if (loading()) {
          <div class="empty-state">
            <div class="dot-loader"><span></span><span></span><span></span></div>
          </div>
        } @else if (profiles().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">◈</div>
            <p>Sin perfiles todavía.</p>
            <button (click)="showCreate = true" class="btn-primary">Crear primero</button>
          </div>
        } @else {
          <div class="grid">
            @for (p of profiles(); track p.info.slug) {
              <div class="profile-card">
                <div class="pc-accent"></div>
                <div class="pc-top">
                  @if (p.info.avatarUrl) {
                    <img [src]="p.info.avatarUrl" alt="" class="pc-avatar" />
                  } @else {
                    <div class="pc-avatar pc-initial">{{ p.info.name[0].toUpperCase() }}</div>
                  }
                  <div>
                    <div class="pc-name">{{ p.info.name }}</div>
                    <div class="pc-slug">{{ p.info.slug }}</div>
                  </div>
                </div>
                <div class="pc-stats">
                  <div class="stat"><span class="stat-v">{{ p.stats.totalViews }}</span><span class="stat-l">vistas</span></div>
                  <div class="stat"><span class="stat-v">{{ p.stats.totalClicks }}</span><span class="stat-l">clicks</span></div>
                  <div class="stat"><span class="stat-v">{{ p.links.length }}</span><span class="stat-l">links</span></div>
                </div>
                <div class="pc-actions">
                  <a [routerLink]="['/admin/profile', p.info.slug]" class="btn-primary sm">Editar</a>
                  <a [routerLink]="['/admin/stats', p.info.slug]" class="btn-ghost sm">Stats</a>
                  <a [href]="'/' + p.info.slug" target="_blank" class="btn-ghost sm">Ver ↗</a>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { --v: #7c3aed; --c: #06b6d4; --r: #f43f5e; display: block; }

    .shell {
      min-height: 100vh;
      display: flex;
      background: #0b0b1e;
      color: #eeeeff;
      font-family: Inter, sans-serif;
    }

    /* Sidebar */
    .sidebar {
      width: 220px; flex-shrink: 0;
      background: rgba(255,255,255,0.03);
      border-right: 1px solid rgba(255,255,255,0.07);
      display: flex; flex-direction: column;
      padding: 28px 16px;
      gap: 0;
    }
    .brand {
      display: flex; align-items: center; gap: 8px;
      font-size: 1.1rem; font-weight: 700;
      margin-bottom: 36px; padding: 0 8px;
    }
    .brand-icon {
      background: linear-gradient(135deg, var(--v), var(--c));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; font-size: 1.2rem;
    }
    .nav { flex: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px;
      text-decoration: none; color: rgba(255,255,255,0.5);
      font-size: 0.9rem; transition: background 0.15s, color 0.15s;
      margin-bottom: 4px;
    }
    .nav-item.active, .nav-item:hover {
      background: rgba(124,58,237,0.15);
      color: white;
    }
    .sidebar-user {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 8px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }
    .u-avatar { width: 28px; height: 28px; border-radius: 50%; }
    .u-name { flex: 1; font-size: 0.85rem; color: rgba(255,255,255,0.6); }
    .u-logout { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 1rem; transition: color 0.15s; }
    .u-logout:hover { color: var(--r); }

    /* Main */
    .main { flex: 1; padding: 32px 36px; overflow-y: auto; }
    .topbar {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 28px;
    }
    h1 { margin: 0 0 2px; font-size: 1.6rem; font-weight: 700; }
    .sub { margin: 0; color: rgba(255,255,255,0.35); font-size: 0.85rem; }

    /* Create panel */
    .create-panel {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 20px 24px;
      margin-bottom: 24px;
    }
    .create-panel h3 { margin: 0 0 14px; font-size: 1rem; color: white; }
    .create-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .inp {
      flex: 1; min-width: 160px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; color: white; font-size: 0.9rem;
      color-scheme: dark;
    }
    .inp::placeholder { color: rgba(255,255,255,0.3); }
    .inp:focus { outline: none; border-color: var(--v); }
    .slug-hint { margin: 8px 0 0; font-size: 0.8rem; color: rgba(255,255,255,0.35); }
    .slug-hint strong { color: var(--c); }
    .err { color: var(--r); font-size: 0.85rem; margin-top: 8px; }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .profile-card {
      position: relative;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; padding: 20px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .profile-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.3);
    }
    .pc-accent {
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--v), var(--c), var(--r));
    }
    .pc-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .pc-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
    .pc-initial {
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--v), var(--c));
      color: white; font-size: 1.4rem; font-weight: 700;
    }
    .pc-name { font-weight: 600; color: white; font-size: 1rem; }
    .pc-slug { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin-top: 2px; }
    .pc-stats {
      display: flex; gap: 0;
      border-top: 1px solid rgba(255,255,255,0.07);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      margin-bottom: 16px; padding: 12px 0;
    }
    .stat { flex: 1; text-align: center; }
    .stat-v { display: block; font-size: 1.25rem; font-weight: 700; color: white; }
    .stat-l { font-size: 0.72rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.05em; }
    .pc-actions { display: flex; gap: 8px; }

    /* Buttons */
    .btn-create {
      padding: 10px 20px;
      background: linear-gradient(135deg, var(--v), var(--c));
      color: white; border: none; border-radius: 12px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .btn-create:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary {
      padding: 9px 16px;
      background: linear-gradient(135deg, var(--v), var(--c));
      color: white; border: none; border-radius: 10px;
      font-size: 0.85rem; font-weight: 500; cursor: pointer;
      text-decoration: none; display: inline-block;
      transition: opacity 0.2s;
    }
    .btn-primary.sm { padding: 7px 12px; font-size: 0.8rem; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost {
      padding: 9px 16px;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; font-size: 0.85rem; cursor: pointer;
      text-decoration: none; display: inline-block;
      transition: background 0.15s, color 0.15s;
    }
    .btn-ghost.sm { padding: 7px 10px; font-size: 0.8rem; }
    .btn-ghost:hover { background: rgba(255,255,255,0.1); color: white; }

    /* Empty / loading */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 80px 0; gap: 16px;
      color: rgba(255,255,255,0.3);
    }
    .empty-icon { font-size: 3rem; opacity: 0.3; }
    .dot-loader { display: flex; gap: 8px; }
    .dot-loader span {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--v); animation: bounce 1.2s ease-in-out infinite;
    }
    .dot-loader span:nth-child(2) { animation-delay: 0.2s; background: var(--c); }
    .dot-loader span:nth-child(3) { animation-delay: 0.4s; background: var(--r); }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 640px) {
      .sidebar { display: none; }
      .main { padding: 20px 16px; }
    }
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

  firstName() {
    const name = this.authService.currentUser()?.displayName ?? '';
    return name.split(' ')[0] ?? '';
  }

  ngOnInit() { this.loadProfiles(); }

  async loadProfiles() {
    this.loading.set(true);
    try { this.profiles.set(await this.profileService.getMyProfiles()); }
    finally { this.loading.set(false); }
  }

  async createProfile() {
    if (!this.newName || !this.newSlug) return;
    this.creating = true; this.createError = '';
    try {
      await this.profileService.createProfile(this.newSlug, this.newName);
      this.showCreate = false; this.newName = ''; this.newSlug = '';
      await this.loadProfiles();
    } catch (e: any) {
      this.createError = e.message ?? 'Error al crear';
    } finally { this.creating = false; }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
