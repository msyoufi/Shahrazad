import { inject, Injectable, signal } from '@angular/core';
import { ImageStorageService } from '../../../shared/services/image-storage';
import { PaintingsService } from '../../../shared/services/paintings';
import { Snackbar } from '../../../shared/components/snackbar';

@Injectable({
  providedIn: 'root'
})
export class PaintingFormService {
  private imageStorageService = inject(ImageStorageService);
  private paintingsService = inject(PaintingsService);
  private snackbar = inject(Snackbar);

  public progress = signal('');

  getPainting(id: string | undefined): Painting | undefined {
    if (!id || id === 'new') return;

    return this.paintingsService.paintings.find(p => p.id === id);
  }

  async createPainting(
    payload: PaintingFormData,
    mainImage: File,
    closeUps: (LocalImageUrl | ImageUrls)[]
  ): Promise<void> {
    const id = new Date().getTime().toString();

    this.progress.set('Uploading The Main Image...');
    const main_image = await this.imageStorageService.compressAndUpload(mainImage, id);

    let close_ups: ImageUrls[] = [];

    if (closeUps.length) {
      this.progress.set('Uplaoding The Close-Up Images...');
      close_ups = await this.uploadCloseUps(closeUps, id, 0);
    }

    const newPainting = {
      id,
      order: this.paintingsService.paintings.length + 1,
      main_image,
      close_ups,
      ...payload
    };

    this.progress.set('Saving Changes...');
    await this.paintingsService.createPainting(newPainting);
  }

  async updatePainting(
    currPainting: Painting,
    payload: PaintingFormData,
    mainImage: File | undefined,
    closeUps: (LocalImageUrl | ImageUrls)[]
  ): Promise<void> {
    const newData = { ...currPainting, ...payload };

    if (mainImage) {
      this.progress.set('Updating The Main Image...');
      newData.main_image = await this.imageStorageService.compressAndUpload(mainImage, currPainting.id);
    }

    newData.close_ups = await this.updateCloseUps(currPainting, closeUps);

    this.progress.set('Saving Changes...');
    await this.paintingsService.updatePainting(newData);
  }

  async deletePainting(painting: Painting): Promise<void> {
    const { id, main_image, order, close_ups } = painting;

    this.progress.set('Deleting All Images...');
    await this.imageStorageService.bulkDeleteImages([main_image, ...close_ups], id);

    // Reorder all paintings if is not the last one
    if (order !== this.paintingsService.paintings.length) {
      this.progress.set("Reordering the Paintings...");
      await this.paintingsService.updatePaintingsOrder(id, order, true);
    }

    this.progress.set("Deleting Painting's Data...");
    await this.paintingsService.deletePainting(id);
  }

  checkValidImage(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.snackbar.show(`Invalid image type: ${file.name}`, 'red');
      return false;
    }

    return true;
  }

  getLocalUrl(file: File): LocalImageUrl {
    return {
      file: file,
      thumbnail: URL.createObjectURL(file)
    }
  }

  private async updateCloseUps(
    currPainting: Painting,
    newCloseUps: (LocalImageUrl | ImageUrls)[]
  ): Promise<ImageUrls[]> {
    const { id, close_ups: currCloseUps } = currPainting;

    // delete removed close ups
    const remaindIds = newCloseUps.filter(cu => 'id' in cu).map(cu => cu.id);
    const removedImages = currCloseUps.filter(cu => !remaindIds.includes(cu.id));

    if (removedImages.length) {
      this.progress.set('Deleting Removed Close Up Images...');
      await this.imageStorageService.bulkDeleteImages(removedImages, id);
    }
    // upload / update new close ups
    // get the name of the last existing close up to start naming new images at that point
    const lastName = parseInt(remaindIds.sort((a, b) => a.localeCompare(b)).at(-1) ?? '0');

    this.progress.set('Updating The Close Up Images...');
    return await this.uploadCloseUps(newCloseUps, id, lastName);
  }

  private async uploadCloseUps(
    closeUps: (LocalImageUrl | ImageUrls)[],
    paintingId: string,
    lastCloseUpName: number
  ): Promise<ImageUrls[]> {
    const uploadPromises = closeUps.map((cu, i) => {
      const order = i + 1;

      if ('id' in cu) { // already exists, just update order
        cu.order = order;
        return cu;
      }

      // upload new image
      return this.imageStorageService.compressAndUpload(cu.file, paintingId, (++lastCloseUpName).toString(), order);
    });

    return Promise.all(uploadPromises);
  }
}