import { Component, inject, Input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { Snackbar } from '../../../shared/components/snackbar';
import { PaintingsService } from '../../../shared/services/paintings';
import { ImageStorageService } from '../../../shared/services/image-storage';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { type CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmDialogService } from '../../../shared/components/confirmation-dialog/confirm-dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'shari-painting-form',
  imports: [ReactiveFormsModule, ShariButton, MatProgressSpinner, CdkDrag, CdkDropList],
  templateUrl: './painting-form.html',
  styleUrl: './painting-form.scss'
})
export class PaintingForm {
  imageStorageService = inject(ImageStorageService);
  paintingsService = inject(PaintingsService);
  confirmDialog = inject(ConfirmDialogService);
  router = inject(Router);
  snackbar = inject(Snackbar);

  @Input() set id(id: string | undefined) {
    if (!id || id === 'new') return;

    this.getPainting(id);
    this.populateForm();
  }

  MAX_CLOSEUP_COUNT = 5;
  currentYear = new Date().getFullYear();

  painting = signal<Painting | undefined>(undefined);
  mainImage = signal<LocalImageUrl | undefined>(undefined);
  closeUps = signal<(LocalImageUrl | ImageUrls)[]>([]);
  isLoading = signal(false);
  progress = signal('');

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    material: new FormControl('', { nonNullable: true }),
    width: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    height: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    year: new FormControl('', { nonNullable: true, validators: [Validators.min(2000), Validators.max(this.currentYear)] })
  });

  getPainting(id: string): void {
    const painting = this.paintingsService.paintings.find(p => p.id === id);
    this.painting.set(painting);
  }

  populateForm(): void {
    const painting = this.painting();

    if (painting)
      this.form.patchValue({
        title: painting.title,
        material: painting.material,
        width: painting.width.toString(),
        height: painting.height.toString(),
        year: painting.year.toString()
      });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.snackbar.show('Invalid Painting Data!', 'red');
      return;
    }

    this.isLoading.set(true);

    const existingPainting = this.painting();
    let message = 'New Painting Added';

    try {
      if (existingPainting) {
        const newData = { ...existingPainting, ...this.prepareFormData() };
        message = 'Changes Saved';

        const mainImage = this.mainImage();

        if (mainImage) {
          newData.main_image = await this.uploadMainImage(mainImage.file, existingPainting.id);
        }

        await this.paintingsService.updatePainting(newData);

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
    const mainImage = this.mainImage();

    if (!mainImage) {
      this.snackbar.show('Please select an image!', 'red');
      return null;
    }

    const id = new Date().getTime().toString();

    return {
      id,
      order: this.paintingsService.paintings.length,
      main_image: await this.uploadMainImage(mainImage.file, id),
      close_ups: [],
      ...this.prepareFormData()
    };
  }

  async uploadMainImage(img: File, paintingId: string): Promise<ImageUrls> {
    return this.imageStorageService.compressAndUpload(img, paintingId);
  }

  onMainImageChange(e: any): void {
    const file = e.target.files[0];
    if (!file) return;

    if (!this.checkValidImage(file)) {
      return;
    }

    this.mainImage.set({
      file: file,
      thumbnail: URL.createObjectURL(file)
    });
  }

  onRemoveMainImageClick(input: HTMLInputElement): void {
    input.value = '';
    this.mainImage.set(undefined);
  }

  async onSaveClick(): Promise<void> {
    const painting = this.painting();
    if (!painting) return;

    this.isLoading.set(true);

    const { id, close_ups } = painting;

    try {
      // delete removed close ups
      const newIds = this.closeUps().filter(cu => 'id' in cu).map(cu => cu.id);
      const removedImages = close_ups.filter(cu => !newIds.includes(cu.id));

      if (removedImages.length) {
        this.progress.set('Deleting removed images...');
        await this.imageStorageService.bulkDeleteImages(removedImages, id);
      }
      // upload / update new close ups
      // get the name of the last added image to start naming new images at that point
      const lastName = parseInt(newIds.sort((a, b) => a.localeCompare(b)).at(-1) ?? '0');

      this.progress.set('Uploading new images...');
      const newImagesUrls = await this.getNewImagesUrls(id, lastName);

      this.progress.set('Saving changes...');
      await this.paintingsService.updatePainting({ id, close_ups: newImagesUrls });

      this.snackbar.show('Changes Saved!');
      this.closeForm();

    } catch (err: unknown) {
      this.snackbar.show('Unable To Upload The Images!', 'red');

    } finally {
      this.isLoading.set(false);
      this.progress.set('');
    }
  }

  async getNewImagesUrls(paintingId: string, lastName: number): Promise<ImageUrls[]> {
    const uploadPromises = this.closeUps().map((cu, i) => {
      const order = i + 1;

      if ('id' in cu) { // already exists, just update order
        cu.order = order;
        return cu;
      }

      // upload new image
      return this.imageStorageService.compressAndUpload(cu.file, paintingId, (++lastName).toString(), order);
    });

    return Promise.all(uploadPromises);
  }

  onCloseupImageChange(e: any): void {
    const files = e.target.files;
    if (!files.length) return;

    const localUrls: LocalImageUrl[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!this.checkValidImage(file)) {
        break;
      }

      localUrls.push({
        file: file,
        thumbnail: URL.createObjectURL(file)
      });
    }

    let nextCloseUps = this.closeUps().concat(localUrls);

    // ensure only MAX_CLOSEUP_COUNT elements in the array
    if (nextCloseUps.length > this.MAX_CLOSEUP_COUNT) {
      nextCloseUps = nextCloseUps.slice(0, this.MAX_CLOSEUP_COUNT);
      this.snackbar.show(`Max ${this.MAX_CLOSEUP_COUNT} Close-Ups`, 'red');
    }

    this.closeUps.set(nextCloseUps);
  }

  checkValidImage(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.snackbar.show(`Invalid file type: ${file.name}`, 'red');
      return false;
    }

    return true;
  }

  onDrop(event: CdkDragDrop<(LocalImageUrl | ImageUrls)[]>): void {
    moveItemInArray(this.closeUps(), event.previousIndex, event.currentIndex);
  }

  async onRemoveClick(index: number): Promise<void> {
    // @ts-ignore
    const id = this.closeUps().filter((_, i) => index === i)[0]?.id;

    // confirm bevor deleting already existing closeups
    if (id !== undefined) {
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

  async onDeleteClick(painting: Painting): Promise<void> {
    const confirm = await this.confirmDialog.open({
      title: 'Remove Painting',
      message: `Remove the painting: ${painting.title} and all its images?`,
      actionButton: 'Remove'
    });

    if (!confirm) return;

    this.deletePainting(painting);
  }

  async deletePainting(painting: Painting): Promise<void> {
    const { id, main_image, close_ups } = painting;

    try {
      // delete all images
      await this.imageStorageService.bulkDeleteImages([main_image, ...close_ups], id);

      // delete from firestore
      await this.paintingsService.deletePainting(id);

      this.snackbar.show('Painting Removed!');

    } catch (err: unknown) {
      console.log(err)
      this.snackbar.show('Unable To Remove The Painting!', 'red');

    } finally {
      this.isLoading.set(false);
    }
  }

  closeForm(): void {
    this.router.navigateByUrl('dashboard-1975/overview')
  }
}