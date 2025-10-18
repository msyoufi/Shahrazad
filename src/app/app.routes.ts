import { Routes } from '@angular/router';
import { Home } from './pages/home/home'
import { authGuard } from './auth.guard';
import { PaintingsOverview } from './pages/dashboard/paintings-overview/paintings-overview';
import { PaintingForm } from './pages/dashboard/painting-form/painting-form';
import { PaintingDetails } from './pages/painting-details/painting-details';
import { About } from './pages/about/about';
import { ProfileForm } from './pages/dashboard/profile-form/profile-form';
import { SecurityForm } from './pages/dashboard/security-form/security-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'painting/:id', component: PaintingDetails },
  { path: 'about', component: About },
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
      { path: '', pathMatch: 'full', redirectTo: 'paintings' },
      { path: 'paintings', component: PaintingsOverview },
      { path: 'painting/:id', component: PaintingForm },
      { path: 'profile', component: ProfileForm },
      { path: 'security', component: SecurityForm },
    ]
  }
];