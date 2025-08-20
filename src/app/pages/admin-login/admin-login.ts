import { Component, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../shared/services/auth';
import { Router } from '@angular/router';
import { Snackbar } from '../../shared/components/snackbar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule, NgForm } from '@angular/forms';
import { ShariButton } from '../../shared/components/button/shari-button';
import { PasswordToggle } from '../../shared/components/password-toggle';
import { FirebaseError } from '@angular/fire/app';

@Component({
  selector: 'shari-admin-login',
  imports: [FormsModule, MatProgressSpinner, ShariButton, PasswordToggle],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {
  authService = inject(AuthService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  form = viewChild.required<NgForm>('form');
  isLoggingIn = signal(false);
  isResetingPW = signal(false);


  async onSubmit(): Promise<void> {
    if (this.form().controls['email']?.invalid) {
      this.snackbar.show('Invalid Email Address!', 'red');
      return;
    }

    if (this.form().controls['password']?.invalid) {
      this.snackbar.show('Invalid Password!', 'red');
      return;
    }

    this.isLoggingIn.set(true);
    const { email, password } = this.form().value;

    try {
      await this.authService.login(email, password);
      await this.router.navigateByUrl('/dashboard-1975');
      this.snackbar.show('Logged In');

    } catch (err: unknown) {
      let message = 'Login Failed. Unknown Error!';

      if (err instanceof FirebaseError) {
        if (err.code === 'auth/invalid-credential')
          message = 'Email Or Password Incorrect';
      }

      this.snackbar.show(message, 'red', 4000);

    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async onResetPasswordClick(): Promise<void> {
    if (this.form().controls['email']?.invalid) {
      this.snackbar.show('Invalid Email Address!', 'red');
      return;
    }

    this.isResetingPW.set(true);
    const email = this.form().value.email;

    try {
      await this.authService.resetPassword(email);
      this.snackbar.show(`Reset Link Sent To:\n ${email}`, 'green', 5000);

    } catch (err: unknown) {
      this.snackbar.show(`${err}`, 'red', 4000);

    } finally {
      this.isResetingPW.set(false);
    }
  }
}
