import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShariButton } from '../../../../shared/components/button/shari-button';
import { PaintingFormService } from './painting-form.service';
import { Snackbar } from '../../../../shared/components/snackbar';
import { PaintingsService } from '../../../../shared/services/paintings';
import { ImageStorageService } from '../../../../shared/services/image-storage';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'shari-painting-form',
  imports: [ReactiveFormsModule, ShariButton, MatProgressSpinner],
  templateUrl: './painting-form.html',
  styleUrl: './painting-form.scss'
})
export class PaintingForm {
  formService = inject(PaintingFormService);
  paintingsService = inject(PaintingsService);
  imageStorageService = inject(ImageStorageService);
  snackbar = inject(Snackbar);

  mainImage: File | undefined;
  maxYear = new Date().getFullYear();

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    material: new FormControl('', { nonNullable: true }),
    width: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    height: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    year: new FormControl('', { nonNullable: true, validators: [Validators.min(2000), Validators.max(this.maxYear)] })
  });

  isLoading = signal(false);

  constructor() {
    this.populateForm();
  }

  populateForm(): void {
    effect(() => {
      const painting = this.formService.painting;

      if (painting)
        this.form.patchValue({
          title: painting.title,
          material: painting.material,
          width: painting.width.toString(),
          height: painting.height.toString(),
          year: painting.year.toString()
        });
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.snackbar.show('Invalid Painting Data!', 'red');
      return;
    }

    this.isLoading.set(true);

    const existingPainting = this.formService.painting;
    let message = 'New Painting Added';

    try {
      if (existingPainting) {
        const { id, ...newData } = { ...existingPainting, ...this.prepareFormData() };
        message = 'Changes Saved';

        if (this.mainImage) {
          newData.main_image = await this.uploadMainImage(this.mainImage, existingPainting.id)
        }

        await this.paintingsService.updatePainting(id, newData);

      } else {
        const newPainting = await this.createNewPainting();
        if (!newPainting) return;
        await this.paintingsService.createPainting(newPainting);
      }

      this.snackbar.show(message);
      this.closeForm();

    } catch (err: unknown) {
      console.log(err);
      this.snackbar.show('Unable To Save Changes!', 'red');

    } finally {
      this.isLoading.set(false);
    }
  }

  prepareFormData(): PaintingFormData {
    const { title, material, width, height, year } = this.form.getRawValue();
    return {
      title,
      material,
      width: Number(width),
      height: Number(height),
      year: Number(year)
    };
  }

  async createNewPainting(): Promise<Painting | null> {
    if (!this.mainImage) {
      this.snackbar.show('Please select an image!', 'red');
      return null;
    }

    const id = new Date().getTime().toString();

    return {
      id,
      order: this.paintingsService.paintings.length,
      main_image: await this.uploadMainImage(this.mainImage, id),
      close_ups: [],
      ...this.prepareFormData()
    };
  }

  async uploadMainImage(img: File, paintingId: string): Promise<ImageUrls> {
    return this.imageStorageService.compressAndUpload(img, paintingId);
  }

  onImageChange(e: any): void {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snackbar.show('File must be an image', 'red');
      return;
    }

    this.mainImage = file;
  }

  closeForm(): void {
    this.form.reset();
    this.formService.closeForm();
  }
}
