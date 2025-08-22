import { inject, Injectable } from '@angular/core';
import { Storage, uploadBytes, getDownloadURL, type StorageReference, ref, deleteObject } from '@angular/fire/storage';
import imageCompression, { Options } from 'browser-image-compression';

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private storage = inject(Storage);

  async compressAndUpload(
    img: File,
    paintingId: string,
    id: string = 'main',
    order: number = 0
  ): Promise<ImageUrls> {
    const { large, thumbnail } = await this.compressImage(img);
    const { largRef, thumbnailRef } = this.getImageRef(paintingId, id);

    return {
      id,
      large: await this.uploadFile(large, largRef),
      thumbnail: await this.uploadFile(thumbnail, thumbnailRef),
      order: id === 'main' ? 0 : order
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

  async deleteImage(paintingId: string, id: string): Promise<void[]> {
    const { largRef, thumbnailRef } = this.getImageRef(paintingId, id);
    return Promise.all([deleteObject(largRef), deleteObject(thumbnailRef)]);
  }

  private getImageRef(paintingId: string, id: string) {
    const path = paintingId + '/' + id;

    return {
      largRef: ref(this.storage, `paintings/${path}`),
      thumbnailRef: ref(this.storage, `paintings/${path}_thumbnail`)
    };
  }

  private largCompressionOpt: Options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 3000,
    fileType: 'image/jpeg'
  };

  private thumbnailCompressionOpt: Options = {
    maxSizeMB: 0.02,
    maxWidthOrHeight: 500,
    fileType: 'image/jpeg'
  };

  private async compressImage(img: File): Promise<{
    large: File;
    thumbnail: File;
  }> {
    return {
      large: await imageCompression(img, this.largCompressionOpt),
      thumbnail: await imageCompression(img, this.thumbnailCompressionOpt),
    };
  }
}
