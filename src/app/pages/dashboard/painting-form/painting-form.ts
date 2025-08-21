import { Component, inject, Input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { Snackbar } from '../../../shared/components/snackbar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { type CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmDialogService } from '../../../shared/components/confirmation-dialog/confirm-dialog.service';
import { Router } from '@angular/router';
import { PaintingFormService } from './painting-form.service';

@Component({
  selector: 'shari-painting-form',
  imports: [ReactiveFormsModule, ShariButton, MatProgressSpinner, CdkDrag, CdkDropList],
  templateUrl: './painting-form.html',
  styleUrl: './painting-form.scss'
})
export class PaintingForm {
  formService = inject(PaintingFormService);
  confirmDialog = inject(ConfirmDialogService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  @Input() set id(id: string | undefined) {
    const painting = this.formService.getPainting(id);
    if (!painting) return;

    this.painting.set(painting);
    this.populateForm(painting);
  }

  MAX_CLOSEUP_COUNT = 5;
  currentYear = new Date().getFullYear();

  painting = signal<Painting | undefined>(undefined);
  mainImage = signal<LocalImageUrl | undefined>(undefined);
  closeUps = signal<(LocalImageUrl | ImageUrls)[]>([]);
  isLoading = signal(false);

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    material: new FormControl('', { nonNullable: true }),
    width: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    height: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    year: new FormControl('', { nonNullable: true, validators: [Validators.min(2000), Validators.max(this.currentYear)] })
  });

  populateForm(painting: Painting): void {
    const { title, material, width, height, year, close_ups } = painting;

    this.form.patchValue({
      title,
      material,
      width: width.toString(),
      height: height.toString(),
      year: year.toString()
    });

    const initialCloseUps = close_ups.slice().sort((a, b) => a.order - b.order);
    this.closeUps.set(initialCloseUps);
  }

  async onSaveClick(): Promise<void> {
    if (this.form.invalid) {
      this.snackbar.show('Invalid Painting Data!', 'red');
      return;
    }

    this.isLoading.set(true);

    const currPainting = this.painting();
    const mainImage = this.mainImage()?.file;
    const payload = this.preparePayload();
    let message = 'New Painting Added';

    try {
      if (currPainting) {
        await this.formService.updatePainting(currPainting, payload, mainImage, this.closeUps());
        message = 'Changes Saved';

      } else if (!mainImage) {
        // on new painting creation at least the main image MUST be uploaded!
        this.snackbar.show('Please select a main image!', 'red');
        return;

      } else {
        await this.formService.createPainting(payload, mainImage, this.closeUps());
      }

      this.snackbar.show(message);
      this.closeForm();

    } catch (err: unknown) {
      this.snackbar.show('Unable To Save Changes!', 'red');

    } finally {
      this.isLoading.set(false);
      this.formService.progress.set('');
    }
  }

  preparePayload(): PaintingFormData {
    const { title, material, width, height, year } = this.form.getRawValue();

    return {
      title,
      material,
      width: Number(width),
      height: Number(height),
      year: Number(year)
    };
  }

  onMainImageChange(e: any): void {
    const file = e.target.files[0];
    if (!file) return;

    const { checkValidImage, getLocalUrl } = this.formService;
    if (!checkValidImage(file)) return;
    this.mainImage.set(getLocalUrl(file));
  }

  onRemoveMainImageClick(input: HTMLInputElement): void {
    this.mainImage.set(undefined);
    input.value = '';
  }

  onCloseUpImageChange(e: any): void {
    const files = e.target.files;
    if (!files.length) return;

    const localUrls: LocalImageUrl[] = [];
    const { checkValidImage, getLocalUrl } = this.formService;

    for (const file of files) {
      if (!checkValidImage(file)) return;
      localUrls.push(getLocalUrl(file));
    }

    let nextCloseUps = this.closeUps().concat(localUrls);

    // ensure only MAX_CLOSEUP_COUNT elements in the array
    if (nextCloseUps.length > this.MAX_CLOSEUP_COUNT) {
      nextCloseUps = nextCloseUps.slice(0, this.MAX_CLOSEUP_COUNT);
      this.snackbar.show(`Max ${this.MAX_CLOSEUP_COUNT} Close-Ups`, 'red');
    }

    this.closeUps.set(nextCloseUps);
  }

  onCloseUpDrop(event: CdkDragDrop<(LocalImageUrl | ImageUrls)[]>): void {
    moveItemInArray(this.closeUps(), event.previousIndex, event.currentIndex);
  }

  async onRemoveCloseUpClick(closeUp: LocalImageUrl | ImageUrls, index: number): Promise<void> {
    // confirm bevor deleting already existing closeups
    if ('id' in closeUp) {
      const confirm = await this.confirmDialog.open({
        title: 'Remove Close-Up',
        message: `Remove the image at position ${index + 1}?`,
        actionButton: 'Remove'
      });

      if (!confirm) return;
    }

    const nextCloseups = this.closeUps().filter((_, i) => i !== index);
    this.closeUps.set(nextCloseups);
  }

  async onDeletePaintingClick(): Promise<void> {
    const painting = this.painting();
    if (!painting) return;

    const confirm = await this.confirmDialog.open({
      title: 'Delete Painting',
      message: `Delete the painting: ${painting.title} and all its images?`,
      actionButton: 'Delete'
    });

    if (!confirm) return;

    this.deletePainting(painting);
  }

  async deletePainting(painting: Painting): Promise<void> {
    this.isLoading.set(true);

    try {
      await this.formService.deletePainting(painting);
      this.snackbar.show('Painting Deleted!');
      this.closeForm();

    } catch (err: unknown) {
      this.snackbar.show('Unable To Remove The Painting!', 'red');

    } finally {
      this.isLoading.set(false);
      this.formService.progress.set('');
    }
  }

  closeForm(): void {
    this.router.navigateByUrl('dashboard-1975/overview')
  }
}