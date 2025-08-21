import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth';
import { Snackbar } from '../../shared/components/snackbar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'shari-dashboard',
  imports: [RouterOutlet, RouterLink, MatProgressSpinner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  authService = inject(AuthService);
  router = inject(Router);
  snackbar = inject(Snackbar);
  destroyRef = inject(DestroyRef);

  currentTab = signal('');
  isLoggingOut = signal(false);

  constructor() {
    this.listenToPathChnages();
  }

  listenToPathChnages(): void {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if (e instanceof NavigationEnd) {
          const path = e.url.split('/').at(-1) ?? '';
          this.currentTab.set(path);
        }
      });
  }

  async onLogoutClick(): Promise<void> {
    this.isLoggingOut.set(true);

    try {
      await this.authService.logout();
      await this.router.navigateByUrl('');

      this.snackbar.show('Logged Out');

    } catch (err: unknown) {
      this.snackbar.show(`${err}`, 'red', 4000);

    } finally {
      this.isLoggingOut.set(false);
    }
  }
}
