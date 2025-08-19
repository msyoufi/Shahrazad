import { Component, inject, signal } from '@angular/core';
import { CloseupFormService } from './closeup-form.service';
import { ShariButton } from '../../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Snackbar } from '../../../../shared/components/snackbar';

@Component({
  selector: 'shari-closeup-form',
  imports: [ShariButton, MatProgressSpinner],
  templateUrl: './closeup-form.html',
  styleUrl: './closeup-form.scss'
})
export class CloseupForm {
  formService = inject(CloseupFormService);
  snackbar = inject(Snackbar);

  closeups = signal<ImageUrls[]>([]);
  isLoading = signal(false);

  constructor() {
    this.populteImgesView();
  }

  populteImgesView(): void {
    const closeups = this.formService.painting?.close_ups ?? [];
    this.closeups.set(closeups);
  }

  onImageChange(e: any): void {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snackbar.show('File must be an image', 'red');
      return;
    }
  }

  closeForm(): void {
    this.formService.closeForm();
  }
}
