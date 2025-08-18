import { Routes } from '@angular/router';
import { Home } from './pages/home/home'
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'admin-1975-dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard')
      .then(comp => comp.Dashboard)
  }
];
