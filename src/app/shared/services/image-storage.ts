import { inject, Injectable } from '@angular/core';
import { Storage, uploadBytes, getDownloadURL, type StorageReference, ref, deleteObject } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private storage = inject(Storage);

  async compressAndUpload(
    img: File,
    paintingId: string,
    name: string = 'main',
    order: number = 0
  ): Promise<ImageUrls> {
    const { large, thumbnail } = this.compressImage(img);
    const { largRef, thumbnailRef } = this.getImageRef(paintingId, name);

    return {
      id: name,
      large: await this.uploadFile(large, largRef),
      thumbnail: await this.uploadFile(thumbnail, thumbnailRef),
      order: name === 'main' ? 0 : order
    };
  }

  async uploadFile(file: File, imageRef: StorageReference): Promise<string> {
    const result = await uploadBytes(imageRef, file);
    return getDownloadURL(result.ref);
  }

  bulkDeleteImages(images: ImageUrls[], paintingId: string): Promise<void[][]> {
    const deletePromises = images.map(({ id }) =>
      this.deleteImage(paintingId, id)
    );

    return Promise.all(deletePromises);
  }

  async deleteImage(paintingId: string, name: string): Promise<void[]> {
    const { largRef, thumbnailRef } = this.getImageRef(paintingId, name);
    return Promise.all([deleteObject(largRef), deleteObject(thumbnailRef)]);
  }

  private getImageRef(paintingId: string, name: string) {
    return {
      largRef: ref(this.storage, `paintings/${paintingId}/${name}`),
      thumbnailRef: ref(this.storage, `paintings/${paintingId}/${name}_thumbnail`)
    };
  }

  private compressImage(img: File) {
    // TODO
    return {
      large: img,
      thumbnail: img
    };
  }
}
