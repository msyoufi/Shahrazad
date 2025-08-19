import { inject, Injectable } from '@angular/core';
import { Storage, uploadBytes, getDownloadURL, type StorageReference, ref } from '@angular/fire/storage';

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
    const { larg, thumbnail } = this.compressImage(img);
    const { largRef, thumbnailRef } = this.getImageRef(paintingId, name);

    return {
      id: name,
      larg: await this.uploadFile(larg, largRef),
      thumbnail: await this.uploadFile(thumbnail, thumbnailRef),
      order: name === 'main' ? 0 : order
    };
  }

  async uploadFile(file: File, imageRef: StorageReference): Promise<string> {
    const result = await uploadBytes(imageRef, file);
    return getDownloadURL(result.ref);
  }

  async uploadCloseups(closeUps: File[], paintingId: string): Promise<ImageUrls[]> {
    let order = 0;

    const uploadPromises = closeUps.map((img, i) => {
      order = i + 1;
      return this.compressAndUpload(img, paintingId, order.toString(), order)
    });

    return Promise.all(uploadPromises);
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
      larg: img,
      thumbnail: img
    };
  }
}
