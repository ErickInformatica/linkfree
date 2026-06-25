import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-stats',
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="stats-page">
      <header>
        <a [routerLink]="['/admin']" class="back">← Volver</a>
        <h1>📊 Estadísticas — {{ profile()?.info?.name }}</h1>
      </header>

      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <div class="summary-cards">
          <div class="card">
            <div class="card-value">{{ profile()?.stats?.totalViews ?? 0 }}</div>
            <div class="card-label">👁 Vistas totales</div>
          </div>
          <div class="card">
            <div class="card-value">{{ profile()?.stats?.totalClicks ?? 0 }}</div>
            <div class="card-label">🖱 Clicks totales</div>
          </div>
          <div class="card">
            <div class="card-value">{{ profile()?.links?.length ?? 0 }}</div>
            <div class="card-label">🔗 Links activos</div>
          </div>
          <div class="card">
            <div class="card-value">{{ ctr() }}%</div>
            <div class="card-label">📈 CTR</div>
          </div>
        </div>

        <div class="section">
          <h2>Clicks por link</h2>
          <div class="link-stats">
            @for (link of sortedLinks(); track link.id) {
              <div class="link-row">
                <span class="link-name">{{ link.label }}</span>
                <div class="bar-wrap">
                  <div class="bar" [style.width]="barWidth(link.clicks) + '%'"></div>
                </div>
                <span class="link-clicks">{{ link.clicks }}</span>
              </div>
            }
            @if (!sortedLinks().length) {
              <p class="empty">Sin datos de clicks aún.</p>
            }
          </div>
        </div>

        <div class="section">
          <h2>Últimas visitas</h2>
          <div class="clicks-list">
            @for (c of recentClicks().slice(0, 20); track $index) {
              <div class="click-row">
                <span>{{ c.linkId }}</span>
                <span class="ts">{{ c.timestamp | slice:0:16 }}</span>
              </div>
            }
            @if (!recentClicks().length) {
              <p class="empty">Sin datos aún.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-page { min-height: 100vh; background: #f7f8fa; font-family: Inter, sans-serif; padding: 0 0 48px; }
    header { background: white; padding: 20px 32px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; }
    .back { color: #667eea; text-decoration: none; font-weight: 500; }
    h1 { margin: 0; font-size: 1.25rem; color: #1a202c; }
    .loading, .empty { text-align: center; color: #888; padding: 32px; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; padding: 24px 32px; }
    .card { background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card-value { font-size: 2.5rem; font-weight: 700; color: #764ba2; }
    .card-label { font-size: 0.9rem; color: #666; margin-top: 4px; }
    .section { background: white; margin: 0 32px 24px; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    h2 { margin: 0 0 16px; font-size: 1.1rem; color: #1a202c; }
    .link-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .link-name { width: 160px; font-size: 0.9rem; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-wrap { flex: 1; background: #f0f0f0; border-radius: 4px; height: 12px; }
    .bar { height: 12px; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 4px; transition: width 0.5s; }
    .link-clicks { width: 40px; text-align: right; font-size: 0.9rem; color: #555; font-weight: 600; }
    .clicks-list { display: flex; flex-direction: column; gap: 8px; }
    .click-row { display: flex; justify-content: space-between; padding: 8px 12px; background: #f7f8fa; border-radius: 6px; font-size: 0.85rem; }
    .ts { color: #888; }
  `],
})
export class StatsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  profile = signal<Profile | null>(null);
  recentClicks = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.load(slug);
  }

  async load(slug: string) {
    const [p, clicks] = await Promise.all([
      this.profileService.getProfile(slug),
      this.profileService.getClicksHistory(slug),
    ]);
    this.profile.set(p);
    this.recentClicks.set(clicks.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    this.loading.set(false);
  }

  sortedLinks() {
    return [...(this.profile()?.links ?? [])].sort((a, b) => b.clicks - a.clicks);
  }

  maxClicks() {
    return Math.max(...(this.profile()?.links ?? []).map(l => l.clicks), 1);
  }

  barWidth(clicks: number) {
    return Math.round((clicks / this.maxClicks()) * 100);
  }

  ctr() {
    const views = this.profile()?.stats?.totalViews ?? 0;
    const clicks = this.profile()?.stats?.totalClicks ?? 0;
    if (!views) return 0;
    return Math.round((clicks / views) * 100);
  }
}
