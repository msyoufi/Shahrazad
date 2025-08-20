import { Component, inject, signal } from '@angular/core';
import { CloseupFormService } from './closeup-form.service';
import { ShariButton } from '../../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Snackbar } from '../../../../shared/components/snackbar';
import { ImageStorageService } from '../../../../shared/services/image-storage';
import { PaintingsService } from '../../../../shared/services/paintings';
import { type CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmDialogService } from '../../../../shared/components/confirmation-dialog/confirm-dialog.service';

@Component({
  selector: 'shari-closeup-form',
  imports: [ShariButton, MatProgressSpinner, CdkDrag, CdkDropList],
  templateUrl: './closeup-form.html',
  styleUrl: './closeup-form.scss'
})
export class CloseupForm {
  formService = inject(CloseupFormService);
  imageStorageService = inject(ImageStorageService);
  paintingsService = inject(PaintingsService);
  confirmDialog = inject(ConfirmDialogService);
  snackbar = inject(Snackbar);

  MAX_COUNT = 5;

  closeUps = signal<(LocalImageUrl | ImageUrls)[]>([]);
  isLoading = signal(false);
  progress = signal('Deleting removed images...');

  constructor() {
    this.populteCurrentCloseups();
  }

  populteCurrentCloseups(): void {
    const initialImages = this.formService.painting?.close_ups.slice() ?? [];
    initialImages.sort((a, b) => a.order - b.order);
    this.closeUps.set(initialImages);
  }

  async onSaveClick(): Promise<void> {
    const painting = this.formService.painting;
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
      await this.paintingsService.updatePainting(id, { close_ups: newImagesUrls });

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

  onImageChange(e: any): void {
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

    // ensure only MAX_COUNT elements in the array
    if (nextCloseUps.length > this.MAX_COUNT) {
      nextCloseUps = nextCloseUps.slice(0, this.MAX_COUNT);
      this.snackbar.show(`Max ${this.MAX_COUNT} Close-Ups`, 'red');
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

  closeForm(): void {
    this.formService.closeForm();
    this.progress.set('');
  }
}