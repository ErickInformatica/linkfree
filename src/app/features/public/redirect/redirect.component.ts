import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-redirect',
  template: `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;color:#666;">Redirigiendo...</div>`,
})
export class RedirectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    const linkId = this.route.snapshot.paramMap.get('linkId')!;

    const profile = await this.profileService.getProfile(slug);
    if (!profile) { window.location.href = '/'; return; }

    const link = profile.links.find(l => l.id === linkId);
    if (!link) { window.location.href = `/${slug}`; return; }

    await this.profileService.trackClick(slug, linkId);
    window.location.href = link.url;
  }
}
