import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Unsubscribe } from '@angular/fire/database';
import { doc, Firestore, DocumentReference, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Storage, uploadBytes, ref, getDownloadURL } from '@angular/fire/storage';
import imageCompression from 'browser-image-compression';
import { Snackbar } from '../components/snackbar';

@Injectable({
  providedIn: 'root'
})
export class ProfileService implements OnDestroy {
  private db = inject(Firestore);
  private storage = inject(Storage);
  private snackbar = inject(Snackbar);

  private profile$ = signal<Profile | undefined>(undefined);
  public progress = signal('');

  private unsubscribe: Unsubscribe | undefined;

  get profile(): Profile | undefined {
    return this.profile$();
  }

  constructor() {
    this.subscribeToChanges();
  }

  private subscribeToChanges(): void {
    const profileRef = this.getProfileRef();

    try {
      this.unsubscribe = onSnapshot(profileRef, querySnapshot => {
        const profile = querySnapshot.data() as Profile;
        this.profile$.set(profile);
      });

    } catch (err: unknown) {
      this.snackbar.show('Cannot load the profile data!', 'red');
    }
  }

  updateProfile(newData: Partial<Profile>): Promise<void> {
    return updateDoc(this.getProfileRef(), newData);
  }

  async compressAndUpload(img: File, name: string): Promise<string> {
    const compressedImage = await this.compressImage(img);
    return this.uploadImage(compressedImage, name);
  }

  private async uploadImage(img: File, name: string): Promise<string> {
    const imageRef = ref(this.storage, `profile/${name}`);
    const result = await uploadBytes(imageRef, img);
    return getDownloadURL(result.ref);
  }

  private getProfileRef(): DocumentReference {
    return doc(this.db, 'profile/shahrazad');
  }

  private async compressImage(img: File): Promise<File> {
    return await imageCompression(img, {
      maxSizeMB: 1,
      maxWidthOrHeight: 3000,
      fileType: 'image/jpeg'
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe && this.unsubscribe();
  }
}