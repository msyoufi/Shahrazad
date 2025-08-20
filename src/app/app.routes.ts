import { Routes } from '@angular/router';
import { Home } from './pages/home/home'
import { authGuard } from './auth.guard';
import { PaintingsOverview } from './pages/dashboard/paintings-overview/paintings-overview';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'login-1975',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin-login/admin-login').then(comp => comp.AdminLogin)
  },
  {
    path: 'dashboard-1975',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(comp => comp.Dashboard),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: PaintingsOverview },
    ]
  }
];