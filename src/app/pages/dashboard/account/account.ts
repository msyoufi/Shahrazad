import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Snackbar } from '../../../shared/components/snackbar';
import { AuthService } from '../../../shared/services/auth';
import { PasswordForm } from './password-form/password-form';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'shari-account',
  imports: [PasswordForm, ShariButton, MatProgressSpinner],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {
  authService = inject(AuthService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  isLoggingOut = signal(false);

  async onVerifyEmailClick(): Promise<void> {
    const user = this.authService.user;
    if (!user) return;

    try {
      await this.authService.sendVerificationLink(user);
      this.snackbar.show(`Verification Link Sent To:\n ${user.email}`);
    } catch (err: unknown) {
      this.snackbar.show('Unable to send a verification link', 'red');
    }
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
