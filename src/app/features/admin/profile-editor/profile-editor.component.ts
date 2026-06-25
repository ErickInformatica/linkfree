import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile, LinkItem, ProfileTheme, PRESET_ICONS } from '../../../core/models/profile.model';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

@Component({
  selector: 'app-profile-editor',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="editor">
      <header>
        <a [routerLink]="['/admin']" class="back">← Dashboard</a>
        <h1>Editar: {{ profile()?.info?.name }}</h1>
        <div class="header-actions">
          <a [routerLink]="['/admin/stats', slug]" class="btn-ghost">📊 Stats</a>
          <a [href]="'/' + slug" target="_blank" class="btn-ghost">Ver perfil →</a>
        </div>
      </header>

      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <div class="editor-body">
          <!-- INFO -->
          <section class="card">
            <h2>Información</h2>
            <label>Nombre</label>
            <input [(ngModel)]="info.name" class="input" />
            <label>Bio</label>
            <textarea [(ngModel)]="info.bio" class="input" rows="2"></textarea>
            <label>URL del avatar</label>
            <input [(ngModel)]="info.avatarUrl" class="input" placeholder="https://..." />
            <button (click)="saveInfo()" class="btn-primary" [disabled]="saving">Guardar info</button>
            @if (savedInfo) { <span class="saved">✓ Guardado</span> }
          </section>

          <!-- TEMA -->
          <section class="card">
            <h2>Tema visual</h2>
            <label>Tipo de fondo</label>
            <select [(ngModel)]="theme.bgType" class="input">
              <option value="color">Color sólido</option>
              <option value="gradient">Gradiente</option>
              <option value="image">Imagen URL</option>
            </select>

            @if (theme.bgType === 'color') {
              <label>Color</label>
              <div class="color-row">
                <input type="color" [(ngModel)]="theme.bg" class="color-pick" />
                <input [(ngModel)]="theme.bg" class="input" />
              </div>
            }
            @if (theme.bgType === 'gradient') {
              <label>Color 1</label>
              <div class="color-row">
                <input type="color" [(ngModel)]="theme.bg" class="color-pick" />
                <input [(ngModel)]="theme.bg" class="input" />
              </div>
              <label>Color 2</label>
              <div class="color-row">
                <input type="color" [(ngModel)]="theme.bg2" class="color-pick" />
                <input [(ngModel)]="theme.bg2" class="input" />
              </div>
              <label>Dirección</label>
              <select [(ngModel)]="theme.gradientDir" class="input">
                <option value="135deg">Diagonal ↘</option>
                <option value="to bottom">Vertical ↓</option>
                <option value="to right">Horizontal →</option>
                <option value="to top left">Diagonal ↖</option>
              </select>
            }
            @if (theme.bgType === 'image') {
              <label>URL de imagen</label>
              <input [(ngModel)]="theme.bgImageUrl" class="input" placeholder="https://..." />
            }

            <label>Color texto</label>
            <div class="color-row">
              <input type="color" [(ngModel)]="theme.fontColor" class="color-pick" />
              <input [(ngModel)]="theme.fontColor" class="input" />
            </div>

            <label>Color botón</label>
            <div class="color-row">
              <input type="color" [(ngModel)]="theme.btnColor" class="color-pick" />
              <input [(ngModel)]="theme.btnColor" class="input" />
            </div>

            <label>Color texto botón</label>
            <div class="color-row">
              <input type="color" [(ngModel)]="theme.btnTextColor" class="color-pick" />
              <input [(ngModel)]="theme.btnTextColor" class="input" />
            </div>

            <label>Estilo botón</label>
            <select [(ngModel)]="theme.btnStyle" class="input">
              <option value="pill">Pill (redondeado)</option>
              <option value="rounded">Rounded</option>
              <option value="square">Cuadrado</option>
              <option value="shadow">Con sombra</option>
            </select>

            <label>Fuente</label>
            <select [(ngModel)]="theme.fontFamily" class="input">
              <option value="Inter, sans-serif">Inter</option>
              <option value="'Poppins', sans-serif">Poppins</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="Georgia, serif">Georgia</option>
            </select>

            <button (click)="saveTheme()" class="btn-primary" [disabled]="saving">Guardar tema</button>
            @if (savedTheme) { <span class="saved">✓ Guardado</span> }
          </section>

          <!-- LINKS -->
          <section class="card">
            <h2>Links</h2>
            <button (click)="addLink()" class="btn-primary small">+ Agregar link</button>

            <div class="links-list">
              @for (link of links(); track link.id; let i = $index) {
                <div class="link-item" [class.inactive]="!link.active">
                  <div class="link-header">
                    <span class="drag-handle">⠿</span>
                    <input [(ngModel)]="link.label" class="input inline" placeholder="Etiqueta" />
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="link.active" />
                      <span>{{ link.active ? 'Activo' : 'Oculto' }}</span>
                    </label>
                    <button (click)="removeLink(i)" class="btn-danger">✕</button>
                  </div>

                  <input [(ngModel)]="link.url" class="input" placeholder="URL destino (https://...)" />

                  <div class="link-row-opts">
                    <select [(ngModel)]="link.icon" class="input small-sel">
                      @for (k of presetKeys; track k) {
                        <option [value]="k">{{ icons[k] }} {{ k }}</option>
                      }
                    </select>
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="link.highlighted" />
                      <span>⭐ Destacado</span>
                    </label>
                  </div>

                  <div class="schedule-row">
                    <label>Desde</label>
                    <input type="datetime-local" [(ngModel)]="link.scheduledFrom" class="input small-date" />
                    <label>Hasta</label>
                    <input type="datetime-local" [(ngModel)]="link.scheduledTo" class="input small-date" />
                  </div>
                </div>
              }
            </div>

            <button (click)="saveLinks()" class="btn-primary" [disabled]="saving">Guardar links</button>
            @if (savedLinks) { <span class="saved">✓ Guardado</span> }
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .editor { min-height: 100vh; background: #f7f8fa; font-family: Inter, sans-serif; }
    header {
      background: white; padding: 16px 32px;
      display: flex; align-items: center; gap: 16px;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .back { color: #667eea; text-decoration: none; font-weight: 500; }
    h1 { margin: 0; font-size: 1.15rem; color: #1a202c; flex: 1; }
    .header-actions { display: flex; gap: 8px; }
    .editor-body { max-width: 640px; margin: 0 auto; padding: 24px 16px; display: flex; flex-direction: column; gap: 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    h2 { margin: 0 0 16px; font-size: 1rem; color: #1a202c; font-weight: 600; }
    label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 4px; margin-top: 12px; }
    .input {
      width: 100%; padding: 9px 12px; border: 1px solid #e2e8f0;
      border-radius: 8px; font-size: 0.9rem; box-sizing: border-box;
      background: white; color: #333;
    }
    .input.inline { width: auto; flex: 1; }
    .input.small-sel { width: auto; flex: 1; }
    .input.small-date { width: auto; flex: 1; font-size: 0.8rem; }
    .color-row { display: flex; gap: 8px; align-items: center; }
    .color-pick { width: 44px; height: 38px; padding: 2px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
    .links-list { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; }
    .link-item { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #fafafa; }
    .link-item.inactive { opacity: 0.6; }
    .link-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .drag-handle { color: #bbb; cursor: grab; font-size: 1.1rem; }
    .link-row-opts { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
    .schedule-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; flex-wrap: wrap; }
    .schedule-row label { margin: 0; font-size: 0.8rem; }
    .toggle { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; cursor: pointer; white-space: nowrap; }
    .toggle input { cursor: pointer; }
    .btn-primary {
      padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; border: none; border-radius: 8px; font-size: 0.9rem;
      cursor: pointer; margin-top: 12px; transition: opacity 0.2s;
    }
    .btn-primary.small { padding: 7px 14px; font-size: 0.85rem; margin-top: 0; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost {
      padding: 8px 14px; background: transparent; color: #555;
      border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem;
      cursor: pointer; text-decoration: none; display: inline-block;
    }
    .btn-danger { padding: 6px 10px; background: #fed7d7; color: #c53030; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .saved { color: #38a169; font-size: 0.85rem; margin-left: 8px; }
    .loading { text-align: center; padding: 48px; color: #888; }
  `],
})
export class ProfileEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  profile = signal<Profile | null>(null);
  links = signal<LinkItem[]>([]);
  loading = signal(true);
  saving = false;
  savedInfo = false;
  savedTheme = false;
  savedLinks = false;

  slug = '';
  info = { name: '', bio: '', avatarUrl: '' };
  theme: ProfileTheme = {
    bgType: 'gradient', bg: '#667eea', bg2: '#764ba2', gradientDir: '135deg',
    fontColor: '#ffffff', btnColor: '#ffffff', btnTextColor: '#333333',
    btnStyle: 'pill', fontFamily: 'Inter, sans-serif',
  };

  icons = PRESET_ICONS;
  presetKeys = Object.keys(PRESET_ICONS);

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug')!;
    this.load();
  }

  async load() {
    const p = await this.profileService.getProfile(this.slug);
    if (p) {
      this.profile.set(p);
      this.info = { name: p.info.name, bio: p.info.bio, avatarUrl: p.info.avatarUrl };
      this.theme = { ...p.theme };
      this.links.set(p.links.map(l => ({ ...l })));
    }
    this.loading.set(false);
  }

  async saveInfo() {
    this.saving = true;
    await this.profileService.updateInfo(this.slug, this.info as any);
    this.saving = false;
    this.savedInfo = true;
    setTimeout(() => (this.savedInfo = false), 2000);
  }

  async saveTheme() {
    this.saving = true;
    await this.profileService.updateTheme(this.slug, this.theme);
    this.saving = false;
    this.savedTheme = true;
    setTimeout(() => (this.savedTheme = false), 2000);
  }

  async saveLinks() {
    this.saving = true;
    await this.profileService.updateLinks(this.slug, this.links());
    this.saving = false;
    this.savedLinks = true;
    setTimeout(() => (this.savedLinks = false), 2000);
  }

  addLink() {
    const l: LinkItem = {
      id: uid(), label: 'Nuevo link', url: '', icon: 'custom', iconType: 'preset',
      active: true, order: this.links().length, clicks: 0,
      highlighted: false, thumbnail: null, scheduledFrom: null, scheduledTo: null,
    };
    this.links.update(ls => [...ls, l]);
  }

  removeLink(i: number) {
    this.links.update(ls => ls.filter((_, idx) => idx !== i));
  }
}
