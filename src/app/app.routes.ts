import { Routes } from '@angular/router';
import { Home } from './pages/home/home'
import { authGuard } from './auth.guard';
import { PaintingsOverview } from './pages/dashboard/paintings-overview/paintings-overview';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'admin-1975',
    loadComponent: () => import('./pages/admin-login/admin-login').then(comp => comp.AdminLogin)
  },
  {
    path: 'admin-1975-dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(comp => comp.Dashboard),
    children: [
      { path: 'overview', component: PaintingsOverview },
    ]
  }
];