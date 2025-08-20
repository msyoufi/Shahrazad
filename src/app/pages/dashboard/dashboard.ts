import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth';
import { Snackbar } from '../../shared/components/snackbar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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

  currentTab = signal('');
  isLoggingOut = signal(false);

  constructor() {
    this.getCurrentPath();
  }

  getCurrentPath(): void {
    const path = this.router.url.split('/').at(-1) ?? '';
    this.currentTab.set(path);
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
