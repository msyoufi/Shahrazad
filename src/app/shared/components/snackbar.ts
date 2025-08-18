import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class Snackbar {
  private snackBar = inject(MatSnackBar);

  public show(
    message: string,
    color: 'primary' | 'red' | 'green' = 'primary',
    duration = 3000
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, undefined, {
      duration,
      panelClass: ['snack-bar', color]
    });
  }
}