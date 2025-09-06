import { inject, Injectable } from '@angular/core';
import { doc, Firestore, DocumentReference, updateDoc, getDoc } from '@angular/fire/firestore';
import { Storage, uploadBytes, ref, getDownloadURL } from '@angular/fire/storage';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private db = inject(Firestore);
  private storage = inject(Storage);

  async getProfile(): Promise<Profile | undefined> {
    const profile = await getDoc(this.getProfileRef());
    return profile.data() as Profile | undefined;
  }

  updateProfile(newData: Partial<Profile>): Promise<void> {
    return updateDoc(this.getProfileRef(), newData);
  }

  async compressAndUpload(img: File, name: 'profile' | 'cover'): Promise<string> {
    const compressedImage = await this.compressImage(img);
    return this.uploadImage(compressedImage, name);
  }

  private getProfileRef(): DocumentReference {
    return doc(this.db, 'profile/shahrazad');
  }

  private async uploadImage(img: File, name: 'profile' | 'cover'): Promise<string> {
    const imageRef = ref(this.storage, `profile/${name}`);
    const result = await uploadBytes(imageRef, img);
    return getDownloadURL(result.ref);
  }

  private async compressImage(img: File): Promise<File> {
    return await imageCompression(img, {
      maxSizeMB: 1,
      maxWidthOrHeight: 3000,
      fileType: 'image/jpeg'
    });
  }
}