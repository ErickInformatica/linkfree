import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile, LinkItem, PRESET_ICONS } from '../../../core/models/profile.model';

@Component({
  selector: 'app-profile-page',
  template: `
    @if (loading()) {
      <div class="splash"><div class="spinner"></div></div>
    } @else if (!profile()) {
      <div class="not-found">
        <h1>404</h1>
        <p>Perfil no encontrado</p>
      </div>
    } @else {
      <div class="page" [style]="pageStyle()">
        <div class="container">
          @if (profile()!.info.avatarUrl) {
            <img [src]="profile()!.info.avatarUrl" alt="avatar" class="avatar" />
          } @else {
            <div class="avatar-placeholder">{{ profile()!.info.name[0] }}</div>
          }
          <h1 class="name" [style.color]="profile()!.theme.fontColor">{{ profile()!.info.name }}</h1>
          @if (profile()!.info.bio) {
            <p class="bio" [style.color]="profile()!.theme.fontColor">{{ profile()!.info.bio }}</p>
          }

          <div class="links">
            @for (link of activeLinks(); track link.id) {
              <a
                [href]="redirectUrl(link)"
                (click)="trackClick($event, link)"
                class="link-btn"
                [class]="'style-' + profile()!.theme.btnStyle"
                [style.background]="profile()!.theme.btnColor"
                [style.color]="profile()!.theme.btnTextColor"
                target="_blank"
                rel="noopener"
              >
                @if (link.thumbnail) {
                  <img [src]="link.thumbnail" alt="" class="link-thumb" />
                }
                <span class="link-icon">{{ iconFor(link) }}</span>
                <span class="link-label">{{ link.label }}</span>
              </a>
            }
          </div>

          <footer [style.color]="profile()!.theme.fontColor" class="footer">
            <a href="/" style="opacity:0.5; text-decoration:none; font-size:0.75rem;">
              🔗 Linkfree
            </a>
          </footer>
        </div>
      </div>
    }
  `,
  styles: [`
    .splash, .not-found {
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center;
      flex-direction: column; font-family: Inter, sans-serif;
    }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e2e8f0;
      border-top-color: #764ba2; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 32px 16px;
    }
    .container {
      width: 100%; max-width: 480px;
      display: flex; flex-direction: column; align-items: center;
      gap: 0;
    }
    .avatar {
      width: 96px; height: 96px; border-radius: 50%;
      object-fit: cover; border: 3px solid rgba(255,255,255,0.4);
      margin-bottom: 16px;
    }
    .avatar-placeholder {
      width: 96px; height: 96px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; margin-bottom: 16px;
    }
    .name { margin: 0 0 8px; font-size: 1.5rem; font-weight: 700; text-align: center; }
    .bio { margin: 0 0 24px; font-size: 0.95rem; text-align: center; opacity: 0.85; max-width: 340px; }
    .links { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .link-btn {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 1rem; font-weight: 500;
      transition: transform 0.15s, box-shadow 0.15s;
      position: relative;
    }
    .link-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .style-pill { border-radius: 50px; }
    .style-square { border-radius: 4px; }
    .style-shadow { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .link-icon { font-size: 1.2rem; }
    .link-label { flex: 1; text-align: center; }
    .link-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; }
    .footer { margin-top: 8px; }
    .not-found h1 { font-size: 4rem; color: #ccc; margin: 0; }
    .not-found p { color: #999; }
  `],
})
export class ProfilePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private sanitizer = inject(DomSanitizer);

  profile = signal<Profile | null>(null);
  loading = signal(true);

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

  activeLinks(): LinkItem[] {
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
      .sort((a, b) => a.order - b.order);
  }

  pageStyle(): SafeStyle {
    const t = this.profile()?.theme;
    if (!t) return '';
    let bg = '';
    if (t.bgType === 'color') bg = t.bg;
    else if (t.bgType === 'gradient') bg = `linear-gradient(${t.gradientDir ?? '135deg'}, ${t.bg}, ${t.bg2 ?? '#764ba2'})`;
    else if (t.bgType === 'image') bg = `url(${t.bgImageUrl}) center/cover no-repeat`;
    return this.sanitizer.bypassSecurityTrustStyle(
      `background: ${bg}; font-family: ${t.fontFamily};`
    );
  }

  iconFor(link: LinkItem): string {
    if (link.iconType === 'emoji') return link.icon;
    return PRESET_ICONS[link.icon] ?? '🔗';
  }

  redirectUrl(link: LinkItem): string {
    return `/r/${this.profile()!.info.slug}/${link.id}`;
  }

  async trackClick(e: Event, link: LinkItem) {
    // redirect component handles the actual tracking; this is a fallback hint
  }
}
