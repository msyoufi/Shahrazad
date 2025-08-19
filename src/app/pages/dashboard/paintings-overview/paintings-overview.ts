import { Component, inject, signal } from '@angular/core';
import { ShariButton } from "../../../shared/components/button/shari-button";
import { PaintingFormService } from './painting-form/painting-form.service';
import { PaintingsService } from '../../../shared/services/paintings';
import { PaintingForm } from "./painting-form/painting-form";
import { CloseupForm } from './closeup-form/closeup-form';
import { CloseupFormService } from './closeup-form/closeup-form.service';
import { Snackbar } from '../../../shared/components/snackbar';
import { ImageStorageService } from '../../../shared/services/image-storage';
import { ConfirmDialogService } from '../../../shared/components/confirmation-dialog/confirm-dialog.service';

@Component({
  selector: 'shari-paintings-overview',
  imports: [ShariButton, PaintingForm, CloseupForm],
  templateUrl: './paintings-overview.html',
  styleUrl: './paintings-overview.scss'
})
export class PaintingsOverview {
  paintingFormService = inject(PaintingFormService);
  closeupFormService = inject(CloseupFormService);
  imageStorageService = inject(ImageStorageService);
  paintingsService = inject(PaintingsService);
  confirmDialog = inject(ConfirmDialogService);
  snackbar = inject(Snackbar);

  isLoading = signal(false);

  openPaintingForm(painting?: Painting): void {
    this.paintingFormService.openForm(painting);
  }

  openClosupForm(painting: Painting): void {
    this.closeupFormService.openForm(painting);
  }

  async onRemoveClick(painting: Painting): Promise<void> {
    const confirm = await this.confirmDialog.open({
      title: 'Remove Painting',
      message: `Remove the painting: ${painting.title} and all its images?`,
      actionButton: 'Remove'
    });

    if (!confirm) return;

    this.removePainting(painting);
  }

  async removePainting(painting: Painting): Promise<void> {
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
}
