import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './shared/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (state.url.includes('dashboard')) {
    if (!authService.user) {
      router.navigateByUrl('/login-1975');
      return false;
    }

  } else if (state.url.includes('login')) {
    if (authService.user) {
      router.navigateByUrl('/dashboard-1975');
      return false;
    }
  }

  return true;
};