import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile, LinkItem, ProfileTheme, PRESET_ICONS } from '../../../core/models/profile.model';

function uid() { return Math.random().toString(36).slice(2, 10); }

@Component({
  selector: 'app-profile-editor',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="shell">
      <!-- Top bar -->
      <header class="topbar">
        <a [routerLink]="['/admin']" class="back">← Dashboard</a>
        <h1>{{ info.name || 'Sin nombre' }}</h1>
        <div class="topbar-right">
          <a [routerLink]="['/admin/stats', slug]" class="btn-ghost">📊 Stats</a>
          <a [href]="'/' + slug" target="_blank" class="btn-ghost">Ver ↗</a>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">
          <div class="dot-loader"><span></span><span></span><span></span></div>
        </div>
      } @else {
        <!-- Tab bar -->
        <div class="tabs">
          <button [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">👤 Perfil</button>
          <button [class.active]="activeTab === 'theme'" (click)="activeTab = 'theme'">🎨 Tema</button>
          <button [class.active]="activeTab === 'links'" (click)="activeTab = 'links'">🔗 Links</button>
        </div>

        <div class="workspace">
          <!-- Left panel: controls -->
          <div class="controls">

            <!-- INFO TAB -->
            @if (activeTab === 'info') {
              <section class="panel">
                <h2>Información del perfil</h2>
                <label>Nombre</label>
                <input [(ngModel)]="info.name" class="inp" placeholder="Nombre visible" />
                <label>Bio</label>
                <textarea [(ngModel)]="info.bio" class="inp" rows="3" placeholder="Descripción breve..."></textarea>
                <label>URL del avatar</label>
                <input [(ngModel)]="info.avatarUrl" class="inp" placeholder="https://..." />
                @if (info.avatarUrl) {
                  <img [src]="info.avatarUrl" class="avatar-preview" alt="preview" />
                }
                <button (click)="saveInfo()" class="btn-save" [disabled]="saving">
                  @if (saving) { Guardando... } @else { Guardar info }
                </button>
                @if (savedInfo) { <span class="saved-badge">✓ Guardado</span> }
              </section>
            }

            <!-- THEME TAB -->
            @if (activeTab === 'theme') {
              <section class="panel">
                <h2>Tema visual</h2>

                <label>Tipo de fondo</label>
                <div class="seg-ctrl">
                  <button [class.sel]="theme.bgType === 'color'" (click)="theme.bgType = 'color'">Color</button>
                  <button [class.sel]="theme.bgType === 'gradient'" (click)="theme.bgType = 'gradient'">Gradiente</button>
                  <button [class.sel]="theme.bgType === 'image'" (click)="theme.bgType = 'image'">Imagen</button>
                </div>

                @if (theme.bgType === 'color') {
                  <label>Color de fondo</label>
                  <div class="color-row">
                    <input type="color" [(ngModel)]="theme.bg" class="color-swatch" />
                    <input [(ngModel)]="theme.bg" class="inp mono" />
                  </div>
                }
                @if (theme.bgType === 'gradient') {
                  <div class="two-col">
                    <div>
                      <label>Color 1</label>
                      <div class="color-row">
                        <input type="color" [(ngModel)]="theme.bg" class="color-swatch" />
                        <input [(ngModel)]="theme.bg" class="inp mono" />
                      </div>
                    </div>
                    <div>
                      <label>Color 2</label>
                      <div class="color-row">
                        <input type="color" [(ngModel)]="theme.bg2" class="color-swatch" />
                        <input [(ngModel)]="theme.bg2" class="inp mono" />
                      </div>
                    </div>
                  </div>
                  <label>Dirección</label>
                  <div class="seg-ctrl">
                    <button [class.sel]="theme.gradientDir === '135deg'" (click)="theme.gradientDir = '135deg'">↘</button>
                    <button [class.sel]="theme.gradientDir === 'to bottom'" (click)="theme.gradientDir = 'to bottom'">↓</button>
                    <button [class.sel]="theme.gradientDir === 'to right'" (click)="theme.gradientDir = 'to right'">→</button>
                    <button [class.sel]="theme.gradientDir === 'to top'" (click)="theme.gradientDir = 'to top'">↑</button>
                  </div>
                }
                @if (theme.bgType === 'image') {
                  <label>URL imagen de fondo</label>
                  <input [(ngModel)]="theme.bgImageUrl" class="inp" placeholder="https://..." />
                }

                <div class="divider"></div>

                <div class="two-col">
                  <div>
                    <label>Color texto</label>
                    <div class="color-row">
                      <input type="color" [(ngModel)]="theme.fontColor" class="color-swatch" />
                      <input [(ngModel)]="theme.fontColor" class="inp mono" />
                    </div>
                  </div>
                  <div>
                    <label>Color botón</label>
                    <div class="color-row">
                      <input type="color" [(ngModel)]="theme.btnColor" class="color-swatch" />
                      <input [(ngModel)]="theme.btnColor" class="inp mono" />
                    </div>
                  </div>
                </div>

                <label>Texto del botón</label>
                <div class="color-row">
                  <input type="color" [(ngModel)]="theme.btnTextColor" class="color-swatch" />
                  <input [(ngModel)]="theme.btnTextColor" class="inp mono" />
                </div>

                <label>Estilo botón</label>
                <div class="seg-ctrl">
                  <button [class.sel]="theme.btnStyle === 'pill'" (click)="theme.btnStyle = 'pill'">Pill</button>
                  <button [class.sel]="theme.btnStyle === 'rounded'" (click)="theme.btnStyle = 'rounded'">Round</button>
                  <button [class.sel]="theme.btnStyle === 'square'" (click)="theme.btnStyle = 'square'">Square</button>
                  <button [class.sel]="theme.btnStyle === 'shadow'" (click)="theme.btnStyle = 'shadow'">Shadow</button>
                </div>

                <label>Fuente</label>
                <select [(ngModel)]="theme.fontFamily" class="inp">
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>

                <button (click)="saveTheme()" class="btn-save" [disabled]="saving">
                  @if (saving) { Guardando... } @else { Guardar tema }
                </button>
                @if (savedTheme) { <span class="saved-badge">✓ Guardado</span> }
              </section>
            }

            <!-- LINKS TAB -->
            @if (activeTab === 'links') {
              <section class="panel">
                <div class="links-header">
                  <h2>Links</h2>
                  <button (click)="addLink()" class="btn-add">+ Agregar</button>
                </div>

                <div class="links-list">
                  @for (link of links(); track link.id; let i = $index) {
                    <div class="link-item" [class.inactive]="!link.active">
                      <div class="link-row-top">
                        <span class="drag">⠿</span>
                        <select [(ngModel)]="link.icon" class="inp-sm icon-sel">
                          @for (k of presetKeys; track k) {
                            <option [value]="k">{{ icons[k] }} {{ k }}</option>
                          }
                        </select>
                        <input [(ngModel)]="link.label" class="inp-sm flex-1" placeholder="Etiqueta" />
                        <label class="toggle-sm">
                          <input type="checkbox" [(ngModel)]="link.active" />
                          {{ link.active ? 'ON' : 'OFF' }}
                        </label>
                        <button (click)="removeLink(i)" class="btn-remove">✕</button>
                      </div>
                      <input [(ngModel)]="link.url" class="inp" placeholder="https://..." />
                      <div class="link-row-opts">
                        <label class="toggle-sm">
                          <input type="checkbox" [(ngModel)]="link.highlighted" />
                          ⭐ Destacado
                        </label>
                      </div>
                    </div>
                  }
                </div>

                <button (click)="saveLinks()" class="btn-save" [disabled]="saving">
                  @if (saving) { Guardando... } @else { Guardar links }
                </button>
                @if (savedLinks) { <span class="saved-badge">✓ Guardado</span> }
              </section>
            }
          </div>

          <!-- Right panel: live preview -->
          <div class="preview-pane">
            <div class="preview-label">Vista previa en vivo</div>
            <div class="preview-wrap">
              <div class="phone-frame">
                <div class="phone-notch"></div>
                <div class="phone-screen" [style]="previewBg()">
                  <!-- Orbs -->
                  <div class="prev-orb prev-orb1" [style.background]="theme.bg"></div>
                  <div class="prev-orb prev-orb2" [style.background]="theme.bg2 || theme.bg"></div>

                  <div class="prev-content" [style.font-family]="theme.fontFamily">
                    <!-- Avatar -->
                    <div class="prev-avatar-wrap">
                      @if (info.avatarUrl) {
                        <img [src]="info.avatarUrl" class="prev-avatar" alt="" />
                      } @else {
                        <div class="prev-avatar prev-avatar-init" [style.color]="theme.fontColor">
                          {{ (info.name || 'A')[0].toUpperCase() }}
                        </div>
                      }
                    </div>

                    <!-- Name -->
                    <div class="prev-name" [style.color]="theme.fontColor">
                      {{ info.name || 'Nombre del perfil' }}
                    </div>

                    <!-- Bio -->
                    @if (info.bio) {
                      <div class="prev-bio" [style.color]="theme.fontColor">{{ info.bio }}</div>
                    }

                    <!-- Sample links from real data or placeholders -->
                    <div class="prev-links">
                      @for (link of previewLinks(); track link.id) {
                        <div
                          class="prev-link"
                          [class]="'prev-btn-' + theme.btnStyle"
                          [style.background]="theme.btnColor"
                          [style.color]="theme.btnTextColor"
                        >
                          <span>{{ icons[link.icon] ?? '🔗' }}</span>
                          <span class="prev-link-label">{{ link.label }}</span>
                        </div>
                      }
                      @if (previewLinks().length === 0) {
                        <div class="prev-link prev-btn-pill"
                          [style.background]="theme.btnColor"
                          [style.color]="theme.btnTextColor">
                          🔗 Link de ejemplo
                        </div>
                        <div class="prev-link prev-btn-pill"
                          [style.background]="theme.btnColor"
                          [style.color]="theme.btnTextColor">
                          📱 WhatsApp
                        </div>
                      }
                    </div>

                    <div class="prev-footer" [style.color]="theme.fontColor">✦ Linkfree</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { --v: #7c3aed; --c: #06b6d4; --r: #f43f5e; display: block; }

    /* ── Shell ── */
    .shell { min-height: 100vh; background: #0b0b1e; color: #eeeeff; font-family: Inter, sans-serif; display: flex; flex-direction: column; }

    /* ── Topbar ── */
    .topbar {
      display: flex; align-items: center; gap: 16px;
      padding: 14px 24px;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .back { color: var(--c); text-decoration: none; font-size: 0.9rem; flex-shrink: 0; }
    h1 { flex: 1; margin: 0; font-size: 1.1rem; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .topbar-right { display: flex; gap: 8px; flex-shrink: 0; }
    .btn-ghost {
      padding: 7px 13px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6); border-radius: 8px;
      font-size: 0.82rem; cursor: pointer; text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.1); color: white; }

    /* ── Tabs ── */
    .tabs {
      display: flex; gap: 2px; padding: 12px 24px 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .tabs button {
      padding: 9px 18px;
      background: transparent; border: none; border-bottom: 2px solid transparent;
      color: rgba(255,255,255,0.4); font-size: 0.9rem; cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      margin-bottom: -1px;
    }
    .tabs button.active { color: white; border-bottom-color: var(--v); }

    /* ── Workspace split ── */
    .workspace {
      flex: 1; display: flex; overflow: hidden;
    }

    /* ── Controls ── */
    .controls {
      width: 380px; flex-shrink: 0;
      overflow-y: auto;
      border-right: 1px solid rgba(255,255,255,0.07);
      padding: 20px;
    }
    .panel h2 { margin: 0 0 18px; font-size: 1rem; font-weight: 600; color: rgba(255,255,255,0.8); }
    label { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.4); margin: 14px 0 5px; text-transform: uppercase; letter-spacing: 0.06em; }
    .inp {
      width: 100%; padding: 9px 12px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; color: white; font-size: 0.88rem;
      box-sizing: border-box;
    }
    .inp::placeholder { color: rgba(255,255,255,0.25); }
    .inp:focus { outline: none; border-color: var(--v); }
    .inp.mono { font-family: monospace; }
    .inp-sm {
      padding: 7px 10px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: white; font-size: 0.82rem;
    }
    .inp-sm:focus { outline: none; border-color: var(--v); }
    .flex-1 { flex: 1; }
    select.inp, select.inp-sm { cursor: pointer; }

    .color-row { display: flex; gap: 8px; align-items: center; }
    .color-swatch {
      width: 38px; height: 34px; padding: 2px 3px;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
      background: rgba(255,255,255,0.06); cursor: pointer; flex-shrink: 0;
    }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .seg-ctrl {
      display: flex; gap: 4px; flex-wrap: wrap;
    }
    .seg-ctrl button {
      padding: 7px 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5); border-radius: 8px;
      font-size: 0.82rem; cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .seg-ctrl button.sel {
      background: rgba(124,58,237,0.25);
      border-color: var(--v); color: white;
    }

    .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 18px 0; }

    .avatar-preview { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin-top: 8px; border: 2px solid rgba(255,255,255,0.15); }

    .btn-save {
      width: 100%; margin-top: 20px; padding: 11px;
      background: linear-gradient(135deg, var(--v), var(--c));
      color: white; border: none; border-radius: 10px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-save:hover:not(:disabled) { opacity: 0.9; }
    .saved-badge { display: inline-block; margin-top: 8px; color: #4ade80; font-size: 0.82rem; }

    /* Links list */
    .links-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .links-header h2 { margin: 0; }
    .btn-add { padding: 7px 14px; background: rgba(124,58,237,0.25); border: 1px solid var(--v); color: var(--v); border-radius: 8px; font-size: 0.82rem; cursor: pointer; }
    .links-list { display: flex; flex-direction: column; gap: 10px; }
    .link-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; }
    .link-item.inactive { opacity: 0.5; }
    .link-row-top { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .link-row-opts { display: flex; gap: 12px; margin-top: 8px; }
    .drag { color: rgba(255,255,255,0.2); cursor: grab; }
    .icon-sel { width: 100px; }
    .toggle-sm { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; color: rgba(255,255,255,0.5); cursor: pointer; white-space: nowrap; }
    .toggle-sm input { cursor: pointer; accent-color: var(--v); }
    .btn-remove { background: rgba(244,63,94,0.15); border: none; color: var(--r); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 0.85rem; }

    /* ── Preview pane ── */
    .preview-pane {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      padding: 24px; background: rgba(0,0,0,0.2); overflow-y: auto;
    }
    .preview-label {
      font-size: 0.75rem; color: rgba(255,255,255,0.3);
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 20px;
    }
    .preview-wrap { display: flex; align-items: flex-start; justify-content: center; }
    .phone-frame {
      width: 280px;
      background: #111;
      border-radius: 40px;
      padding: 12px;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04);
      position: relative;
    }
    .phone-notch {
      width: 80px; height: 20px;
      background: #111; border-radius: 0 0 12px 12px;
      margin: 0 auto 4px;
      position: relative; z-index: 2;
    }
    .phone-screen {
      border-radius: 28px; overflow: hidden;
      min-height: 520px; position: relative;
      transition: background 0.3s;
    }
    .prev-orb {
      position: absolute; border-radius: 50%;
      filter: blur(40px); opacity: 0.35; pointer-events: none;
      animation: prevDrift 8s ease-in-out infinite alternate;
    }
    .prev-orb1 { width: 160px; height: 160px; top: -40px; left: -40px; }
    .prev-orb2 { width: 120px; height: 120px; bottom: -20px; right: -20px; animation-direction: alternate-reverse; }
    @keyframes prevDrift { from { transform: translate(0,0); } to { transform: translate(12px, 8px); } }

    .prev-content {
      position: relative; z-index: 1;
      padding: 24px 16px;
      display: flex; flex-direction: column; align-items: center; gap: 0;
    }
    .prev-avatar-wrap { margin-bottom: 10px; }
    .prev-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3); }
    .prev-avatar-init {
      width: 64px; height: 64px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 700;
    }
    .prev-name { font-size: 1.1rem; font-weight: 700; text-align: center; margin-bottom: 4px; }
    .prev-bio { font-size: 0.72rem; text-align: center; opacity: 0.7; margin-bottom: 14px; max-width: 200px; line-height: 1.4; }
    .prev-links { width: 100%; display: flex; flex-direction: column; gap: 8px; margin: 8px 0 16px; }
    .prev-link {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; font-size: 0.8rem; font-weight: 500;
      transition: none;
    }
    .prev-link-label { flex: 1; text-align: center; }
    .prev-btn-pill { border-radius: 50px; }
    .prev-btn-rounded { border-radius: 12px; }
    .prev-btn-square { border-radius: 4px; }
    .prev-btn-shadow { border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .prev-footer { font-size: 0.65rem; opacity: 0.4; margin-top: 4px; }

    /* Loading */
    .loading-state { flex: 1; display: flex; align-items: center; justify-content: center; }
    .dot-loader { display: flex; gap: 8px; }
    .dot-loader span { width: 8px; height: 8px; border-radius: 50%; background: var(--v); animation: bounce 1.2s ease-in-out infinite; }
    .dot-loader span:nth-child(2) { animation-delay: 0.2s; background: var(--c); }
    .dot-loader span:nth-child(3) { animation-delay: 0.4s; background: var(--r); }
    @keyframes bounce { 0%,80%,100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

    @media (max-width: 768px) {
      .workspace { flex-direction: column; }
      .controls { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
      .preview-pane { min-height: 600px; }
    }
  `],
})
export class ProfileEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private sanitizer = inject(DomSanitizer);

  profile = signal<Profile | null>(null);
  links = signal<LinkItem[]>([]);
  loading = signal(true);
  saving = false;
  savedInfo = false;
  savedTheme = false;
  savedLinks = false;
  activeTab: 'info' | 'theme' | 'links' = 'theme';

  slug = '';
  info = { name: '', bio: '', avatarUrl: '' };
  theme: ProfileTheme = {
    bgType: 'gradient', bg: '#667eea', bg2: '#764ba2', gradientDir: '135deg',
    bgImageUrl: '',
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

  previewBg(): SafeStyle {
    const t = this.theme;
    let bg = '';
    if (t.bgType === 'color') bg = t.bg;
    else if (t.bgType === 'gradient') bg = `linear-gradient(${t.gradientDir ?? '135deg'}, ${t.bg}, ${t.bg2 ?? '#764ba2'})`;
    else if (t.bgType === 'image' && t.bgImageUrl) bg = `url(${t.bgImageUrl}) center/cover no-repeat`;
    else bg = t.bg;
    return this.sanitizer.bypassSecurityTrustStyle(`background: ${bg};`);
  }

  previewLinks(): LinkItem[] {
    return this.links().filter(l => l.active).slice(0, 4);
  }

  async saveInfo() {
    this.saving = true;
    await this.profileService.updateInfo(this.slug, this.info as any);
    this.saving = false; this.savedInfo = true;
    setTimeout(() => (this.savedInfo = false), 2000);
  }

  async saveTheme() {
    this.saving = true;
    await this.profileService.updateTheme(this.slug, this.theme);
    this.saving = false; this.savedTheme = true;
    setTimeout(() => (this.savedTheme = false), 2000);
  }

  async saveLinks() {
    this.saving = true;
    await this.profileService.updateLinks(this.slug, this.links());
    this.saving = false; this.savedLinks = true;
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
