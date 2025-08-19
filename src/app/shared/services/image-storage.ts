import { inject, Injectable } from '@angular/core';
import { Storage, uploadBytes, getDownloadURL, type StorageReference, ref } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private storage = inject(Storage);

  async compressAndUpload(img: File, id: string, name: string): Promise<ImageUrls> {
    const { larg, thumbnail } = this.compressImage(img);
    const { largRef, thumbnailRef } = this.getImageRef(id, name);

    return {
      larg: await this.uploadFile(larg, largRef),
      thumbnail: await this.uploadFile(thumbnail, thumbnailRef)
    };
  }

  async uploadFile(file: File, imageRef: StorageReference): Promise<string> {
    const result = await uploadBytes(imageRef, file);
    return getDownloadURL(result.ref);
  }

  private getImageRef(id: string, name: string) {
    return {
      largRef: ref(this.storage, `paintings/${id}/${name}`),
      thumbnailRef: ref(this.storage, `paintings/${id}/${name}_thumbnail`)
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
