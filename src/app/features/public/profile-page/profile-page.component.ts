import {
  Component, inject, signal, OnInit, OnDestroy,
  ChangeDetectionStrategy, ElementRef, ViewChildren, QueryList, AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile, LinkItem, PRESET_ICONS } from '../../../core/models/profile.model';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="splash">
        <div class="splash-orb o1"></div>
        <div class="splash-orb o2"></div>
        <div class="loader">
          <span></span><span></span><span></span>
        </div>
      </div>
    } @else if (!profile()) {
      <div class="not-found">
        <div class="nf-code">404</div>
        <p>Este perfil no existe.</p>
      </div>
    } @else {
      <div class="scene" [attr.data-theme]="resolvedTheme()">
        <!-- Animated background orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="noise"></div>

        <main class="profile">
          <!-- Avatar -->
          <div class="avatar-wrap" (mousemove)="tiltAvatar($event)" (mouseleave)="resetAvatar()">
            <div class="avatar-ring"></div>
            @if (profile()!.info.avatarUrl) {
              <img [src]="profile()!.info.avatarUrl" alt="avatar" class="avatar" #avatarEl />
            } @else {
              <div class="avatar avatar-initial">{{ profile()!.info.name[0].toUpperCase() }}</div>
            }
          </div>

          <!-- Name -->
          <h1 class="name">{{ profile()!.info.name }}</h1>

          <!-- Bio -->
          @if (profile()!.info.bio) {
            <p class="bio">{{ profile()!.info.bio }}</p>
          }

          <!-- Social icons strip -->
          <div class="social-strip">
            @for (link of socialLinks(); track link.id) {
              <a
                [href]="redirectUrl(link)"
                class="social-icon"
                target="_blank"
                rel="noopener"
                [title]="link.label"
                (click)="trackClick($event, link)"
              >{{ iconFor(link) }}</a>
            }
          </div>

          <!-- Main links -->
          <div class="links">
            @for (link of mainLinks(); track link.id; let i = $index) {
              <a
                [href]="redirectUrl(link)"
                class="link-btn"
                [class.highlighted]="link.highlighted"
                target="_blank"
                rel="noopener"
                (click)="trackClick($event, link)"
                (mousemove)="tiltBtn($event)"
                (mouseleave)="resetBtn($event)"
                [style.animation-delay]="i * 80 + 'ms'"
              >
                @if (link.thumbnail) {
                  <img [src]="link.thumbnail" alt="" class="link-thumb" />
                } @else {
                  <span class="link-icon">{{ iconFor(link) }}</span>
                }
                <span class="link-label">{{ link.label }}</span>
                <span class="link-arrow">→</span>
                <div class="link-glow"></div>
              </a>
            }
          </div>

          <footer class="footer">
            <a href="https://linkfree-erick.web.app" class="made-with" rel="noopener">
              ✦ Linkfree
            </a>
          </footer>
        </main>
      </div>
    }
  `,
  styles: [`
    /* ─── Theme tokens ─── */
    :host {
      --v: #7c3aed;
      --c: #06b6d4;
      --r: #f43f5e;
    }

    [data-theme="dark"] {
      --bg:        #07071a;
      --surface:   rgba(255,255,255,0.04);
      --border:    rgba(255,255,255,0.08);
      --text:      #eeeeff;
      --muted:     rgba(238,238,255,0.45);
      --btn-bg:    rgba(255,255,255,0.05);
      --btn-hover: rgba(255,255,255,0.10);
      --btn-border:rgba(255,255,255,0.12);
      --shadow:    rgba(0,0,0,0.5);
    }
    [data-theme="light"] {
      --bg:        #f5f5ff;
      --surface:   rgba(255,255,255,0.75);
      --border:    rgba(0,0,0,0.07);
      --text:      #0d0d1a;
      --muted:     rgba(13,13,26,0.45);
      --btn-bg:    rgba(255,255,255,0.8);
      --btn-hover: rgba(255,255,255,1);
      --btn-border:rgba(0,0,0,0.08);
      --shadow:    rgba(80,40,160,0.12);
    }

    /* ─── Layout ─── */
    .scene {
      min-height: 100vh;
      background: var(--bg);
      display: flex; align-items: center; justify-content: center;
      padding: 48px 16px;
      position: relative;
      overflow: hidden;
      transition: background 0.4s;
    }

    /* ─── Orbs ─── */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      will-change: transform;
    }
    .orb-1 {
      width: 520px; height: 520px;
      background: radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%);
      top: -160px; left: -120px;
      animation: drift1 14s ease-in-out infinite alternate;
    }
    .orb-2 {
      width: 440px; height: 440px;
      background: radial-gradient(circle, rgba(6,182,212,0.28) 0%, transparent 70%);
      bottom: -100px; right: -80px;
      animation: drift2 18s ease-in-out infinite alternate;
    }
    .orb-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(244,63,94,0.22) 0%, transparent 70%);
      top: 50%; left: 60%;
      animation: drift3 22s ease-in-out infinite alternate;
    }
    @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(60px,40px) scale(1.1); } }
    @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px,-30px) scale(1.15); } }
    @keyframes drift3 { from { transform: translate(0,0) scale(1); } to { transform: translate(-40px,50px) scale(0.9); } }

    /* ─── Noise grain overlay ─── */
    .noise {
      position: absolute; inset: 0;
      pointer-events: none;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 256px;
    }

    /* ─── Profile card ─── */
    .profile {
      position: relative; z-index: 1;
      width: 100%; max-width: 440px;
      display: flex; flex-direction: column; align-items: center;
      animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ─── Avatar ─── */
    .avatar-wrap {
      position: relative;
      width: 108px; height: 108px;
      margin-bottom: 20px;
      cursor: default;
      perspective: 600px;
    }
    .avatar-ring {
      position: absolute; inset: -4px;
      border-radius: 50%;
      background: conic-gradient(from 0deg, var(--v), var(--c), var(--r), var(--v));
      animation: spin 4s linear infinite;
      opacity: 0.85;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .avatar {
      width: 100px; height: 100px;
      border-radius: 50%;
      object-fit: cover;
      position: absolute; top: 4px; left: 4px;
      z-index: 1;
      transition: transform 0.15s ease;
    }
    .avatar-initial {
      display: flex; align-items: center; justify-content: center;
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 2.5rem;
      color: var(--text);
    }

    /* ─── Text ─── */
    .name {
      margin: 0 0 8px;
      font-size: clamp(1.5rem, 5vw, 2rem);
      font-weight: 700;
      color: var(--text);
      text-align: center;
      background: linear-gradient(120deg, var(--v), var(--c));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .bio {
      margin: 0 0 24px;
      font-size: 0.95rem;
      color: var(--muted);
      text-align: center;
      max-width: 320px;
      line-height: 1.6;
    }

    /* ─── Social strip ─── */
    .social-strip {
      display: flex; gap: 12px;
      margin-bottom: 28px;
      flex-wrap: wrap; justify-content: center;
    }
    .social-icon {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--btn-bg);
      border: 1px solid var(--btn-border);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .social-icon:hover {
      transform: translateY(-3px) scale(1.1);
      box-shadow: 0 8px 24px var(--shadow);
      background: var(--btn-hover);
    }

    /* ─── Link buttons ─── */
    .links {
      width: 100%;
      display: flex; flex-direction: column; gap: 10px;
      margin-bottom: 36px;
    }
    .link-btn {
      position: relative;
      display: flex; align-items: center; gap: 14px;
      padding: 14px 18px;
      border-radius: 16px;
      background: var(--btn-bg);
      border: 1px solid var(--btn-border);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      text-decoration: none;
      color: var(--text);
      font-size: 0.95rem; font-weight: 500;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      overflow: hidden;
      animation: slideIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
      transform-style: preserve-3d;
      will-change: transform;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .link-btn:hover {
      background: var(--btn-hover);
      box-shadow: 0 12px 40px var(--shadow);
    }
    .link-btn.highlighted {
      background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2));
      border-color: rgba(124,58,237,0.35);
    }
    .link-glow {
      position: absolute; inset: 0;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(124,58,237,0), rgba(6,182,212,0));
      transition: background 0.3s;
      pointer-events: none;
    }
    .link-btn:hover .link-glow {
      background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08));
    }
    .link-icon { font-size: 1.25rem; flex-shrink: 0; }
    .link-thumb { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .link-label { flex: 1; }
    .link-arrow { color: var(--muted); font-size: 1rem; transition: transform 0.2s; }
    .link-btn:hover .link-arrow { transform: translateX(4px); }

    /* ─── Footer ─── */
    .footer { margin-top: 8px; }
    .made-with {
      font-size: 0.78rem;
      color: var(--muted);
      text-decoration: none;
      letter-spacing: 0.05em;
      transition: color 0.2s;
    }
    .made-with:hover { color: var(--text); }

    /* ─── Splash / 404 ─── */
    .splash {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: #07071a;
      position: relative; overflow: hidden;
    }
    .splash-orb {
      position: absolute; border-radius: 50%;
      filter: blur(80px); opacity: 0.3;
    }
    .splash-orb.o1 { width: 400px; height: 400px; background: var(--v); top: -100px; left: -100px; }
    .splash-orb.o2 { width: 300px; height: 300px; background: var(--c); bottom: -80px; right: -80px; }
    .loader {
      display: flex; gap: 8px; z-index: 1;
    }
    .loader span {
      width: 10px; height: 10px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      animation: bounce 1.2s ease-in-out infinite;
    }
    .loader span:nth-child(2) { animation-delay: 0.2s; }
    .loader span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
    .not-found {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: var(--bg, #07071a); color: var(--muted, #888);
      font-family: Inter, sans-serif;
    }
    .nf-code {
      font-size: 6rem; font-weight: 700;
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `],
})
export class ProfilePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  profile = signal<Profile | null>(null);
  loading = signal(true);

  private _prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  resolvedTheme(): 'dark' | 'light' {
    const p = this.profile();
    if (!p) return this._prefersDark.matches ? 'dark' : 'light';
    const t = p.theme;
    if (t.bgType === 'color' || t.bgType === 'gradient' || t.bgType === 'image') {
      return this._prefersDark.matches ? 'dark' : 'light';
    }
    return 'dark';
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.loadProfile(slug);
  }

  async loadProfile(slug: string) {
    const p = await this.profileService.getProfile(slug);
    this.profile.set(p);
    this.loading.set(false);
    if (p) this.profileService.incrementView(slug);
  }

  private isSocial(link: LinkItem): boolean {
    const socials = ['whatsapp', 'instagram', 'facebook', 'tiktok', 'youtube', 'twitter', 'linkedin', 'telegram'];
    return socials.includes(link.icon) && !link.highlighted;
  }

  socialLinks(): LinkItem[] {
    return this.visibleLinks().filter(l => this.isSocial(l));
  }

  mainLinks(): LinkItem[] {
    return this.visibleLinks().filter(l => !this.isSocial(l) || l.highlighted);
  }

  visibleLinks(): LinkItem[] {
    const p = this.profile();
    if (!p) return [];
    const now = new Date().toISOString();
    return p.links
      .filter(l => {
        if (!l.active) return false;
        if (l.scheduledFrom && now < l.scheduledFrom) return false;
        if (l.scheduledTo && now > l.scheduledTo) return false;
        return true;
      })
      .sort((a, b) => (a.highlighted ? -1 : 1) - (b.highlighted ? -1 : 1) || a.order - b.order);
  }

  iconFor(link: LinkItem): string {
    if (link.iconType === 'emoji') return link.icon;
    return PRESET_ICONS[link.icon] ?? '🔗';
  }

  redirectUrl(link: LinkItem): string {
    return `/r/${this.profile()!.info.slug}/${link.id}`;
  }

  async trackClick(e: Event, link: LinkItem) {
    // redirect component handles tracking
  }

  tiltBtn(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
  }

  resetBtn(e: MouseEvent) {
    (e.currentTarget as HTMLElement).style.transform = '';
  }

  tiltAvatar(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(400px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
  }

  resetAvatar() {
    const el = document.querySelector('.avatar-wrap') as HTMLElement;
    if (el) el.style.transform = '';
  }
}
