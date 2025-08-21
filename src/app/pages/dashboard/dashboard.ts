import { Component, inject, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth';
import { Snackbar } from '../../shared/components/snackbar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shari-dashboard',
  imports: [RouterOutlet, RouterLink, MatProgressSpinner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  currentTab = signal('');
  isLoggingOut = signal(false);

  routerSub: Subscription | undefined;

  constructor() {
    this.listenToPathChnages();
  }

  listenToPathChnages(): void {
    this.routerSub = this.router.events.subscribe(e => {
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

  ngOnDestroy(): void {
    this.routerSub && this.routerSub.unsubscribe();
  }
}
