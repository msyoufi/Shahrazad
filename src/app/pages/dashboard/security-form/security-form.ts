import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Snackbar } from '../../../shared/components/snackbar';
import { PasswordToggle } from '../../../shared/components/password-toggle';
import { AuthService } from '../../../shared/services/auth';
import ShariValidators from '../../../shared/validators/custom.validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  destroyRef = inject(DestroyRef);

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), ShariValidators.password] }),
  });

  isUpdatingPassword = signal(false);
  passwordError = signal('');

  constructor() {
    this.onNewPasswordChange();
  }

  onNewPasswordChange(): void {
    this.passwordForm.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(_ => {
        const errors = this.passwordForm.controls.newPassword.errors;

        if (!errors) {
          this.passwordError.set('');
          return;
        }

        const errorCode = Object.keys(errors)[0];
        const message = this.getPasswordErrorMessage(errorCode);
        this.passwordError.set(message);
      });
  }

  private getPasswordErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'whiteSpace':
        return 'Whitespace not allowed!';

      case 'noUpper':
        return 'Upper case letter required!';

      case 'noLower':
        return 'Lower case letter required!';

      case 'noDigit':
        return 'Must have a number!';

      case 'minlength':
        return 'Minimum 8 characters!';

      default:
        return 'New password required!';
    }
  }

  async onPasswordFormSubmit(): Promise<void> {
    if (this.passwordForm.invalid) {
      return;
    }

    const user = this.authService.user;
    if (!user) return;

    const { email, emailVerified } = user;

    if (!emailVerified) {
      this.snackbar.show('Please Verify Your Email First!', 'red');
      return;
    }

    this.isUpdatingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    try {
      await this.authService.reauthenticatUser(user, email!, currentPassword);
      await this.authService.setNewPassword(user, newPassword);

      this.passwordForm.reset();
      this.snackbar.show('Password Changed');

    } catch (err: unknown) {
      this.snackbar.show('Unable to reset the password', 'red');

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