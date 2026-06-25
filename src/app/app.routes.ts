import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/admin',
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'admin/profile/:slug',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/profile-editor/profile-editor.component').then(m => m.ProfileEditorComponent),
  },
  {
    path: 'admin/stats/:slug',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/stats/stats.component').then(m => m.StatsComponent),
  },
  {
    path: 'r/:slug/:linkId',
    loadComponent: () => import('./features/public/redirect/redirect.component').then(m => m.RedirectComponent),
  },
  {
    path: ':slug',
    loadComponent: () => import('./features/public/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
  },
];
