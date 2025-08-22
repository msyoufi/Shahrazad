import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Snackbar } from '../snackbar';
import { ShariButton } from '../button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'shari-header',
  imports: [RouterLink, ShariButton, MatProgressSpinner],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  authService = inject(AuthService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  isLoggingOut = signal(false);


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
