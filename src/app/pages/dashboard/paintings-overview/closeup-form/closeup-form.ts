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

  MAX_COUNT = 5;

  localCloseUps = signal<string[]>([]);
  // closeups = signal<ImageUrls[]>([]);
  isLoading = signal(false);

  constructor() {
    // this.populteImgesView();
  }

  populteImgesView(): void {
    // const closeups = this.formService.painting?.close_ups ?? [];
    // this.closeups.set(closeups);
  }

  async onSaveClick(): Promise<void> { 
    
  }

  onImageChange(e: any): void {
    const files = e.target.files;
    if (!files.length) return;

    const localUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!this.checkValidImage(file)) {
        break;
      }

      localUrls.push(URL.createObjectURL(file));
    }

    let nextLocalCloseUps = this.localCloseUps().concat(localUrls);

    // ensure only MAX_COUNT elements in the array
    if (nextLocalCloseUps.length > this.MAX_COUNT) {
      nextLocalCloseUps = nextLocalCloseUps.slice(0, this.MAX_COUNT);
      this.snackbar.show(`Max ${this.MAX_COUNT} Close-Ups`, 'red');
    }

    this.localCloseUps.set(nextLocalCloseUps);
  }

  checkValidImage(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.snackbar.show(`Invalid file type: ${file.name}`, 'red');
      return false;
    }

    return true;
  }

  onRemoveClick(index: number): void {
    const nextCloseups = this.localCloseUps().filter((_, i) => i !== index);
    this.localCloseUps.set(nextCloseups);
  }

  closeForm(): void {
    this.formService.closeForm();
  }
}
