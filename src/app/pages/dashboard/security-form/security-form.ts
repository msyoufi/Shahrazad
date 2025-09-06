import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Snackbar } from '../../../shared/components/snackbar';
import { PasswordToggle } from '../../../shared/components/password-toggle';
import { AuthService } from '../../../shared/services/auth';

@Component({
  selector: 'shari-security-form',
  imports: [ReactiveFormsModule, ShariButton, MatProgressSpinner, PasswordToggle],
  templateUrl: './security-form.html',
  styleUrl: './security-form.scss'
})
export class SecurityForm {
  authService = inject(AuthService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  isUpdatingPassword = signal(false);

  async onPasswordFormSubmit(): Promise<void> {
    const user = this.authService.user;
    if (!user) return;

    this.isUpdatingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    try {
      await this.authService.reauthenticatUser(user, user.email!, currentPassword);
      await this.authService.setNewPassword(user, newPassword);

      this.passwordForm.reset();
      this.snackbar.show('Password Updated');

    } catch (err: unknown) {
      console.log(err);
      this.snackbar.show('error', 'red');

    } finally {
      this.isUpdatingPassword.set(false);
    }
  }

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
}