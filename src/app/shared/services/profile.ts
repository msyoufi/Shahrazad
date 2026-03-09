import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Unsubscribe } from '@angular/fire/database';
import { doc, Firestore, DocumentReference, updateDoc, onSnapshot } from '@angular/fire/firestore';
import imageCompression from 'browser-image-compression';
import { Snackbar } from '../components/snackbar';
import {
  Storage,
  uploadBytes,
  ref,
  getDownloadURL,
  deleteObject,
  StorageReference,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class ProfileService implements OnDestroy {
  private db = inject(Firestore);
  private storage = inject(Storage);
  private snackbar = inject(Snackbar);

  private profile$ = signal<Profile | undefined>(undefined);
  private bioText_ImageList$ = signal<BioTextWithImage[]>([]);

  private unsubscribe: Unsubscribe | undefined;

  get profile(): Profile | undefined {
    return this.profile$();
  }

  get bioText_ImageList(): BioTextWithImage[] {
    return this.bioText_ImageList$();
  }

  constructor() {
    this.subscribeToChanges();
  }

  private subscribeToChanges(): void {
    const profileRef = this.getProfileRef();

    try {
      this.unsubscribe = onSnapshot(profileRef, (querySnapshot) => {
        const profile = querySnapshot.data() as Profile;
        this.profile$.set(profile);

        this.createBioText_ImageList(profile);
      });
    } catch (err: unknown) {
      this.snackbar.show('Cannot load the profile data!', 'red');
    }
  }

  private createBioText_ImageList(profile: Profile): void {
    const list: BioTextWithImage[] = [];
    const { bio_html, studioShotsUrls } = profile;

    const sortedImages = studioShotsUrls.slice().sort((a, b) => a.order - b.order);
    const textChunks = bio_html.split('---');

    const maxItemsCount = Math.max(sortedImages.length, textChunks.length);

    for (let i = 0; i < maxItemsCount; i++) {
      list.push({
        text: textChunks[i] ?? '',
        imageUrl: sortedImages[i]?.url ?? '',
      });
    }

    this.bioText_ImageList$.set(list);
  }

  updateProfile(newData: Partial<Profile>): Promise<void> {
    return updateDoc(this.getProfileRef(), newData);
  }

  bulkDeleteImages(images: StudioShotUrl[]): Promise<void[]> {
    const deletePromises = images.map(({ id }) => {
      const imgRef = this.getImageRef(id);
      return deleteObject(imgRef);
    });

    return Promise.all(deletePromises);
  }

  async compressAndUpload(img: File, name: string): Promise<string> {
    const compressedImage = await this.compressImage(img);
    return this.uploadImage(compressedImage, name);
  }

  async updateStudioShots(
    images: (StudioShotUrl | LocalStudioShotImage)[],
  ): Promise<StudioShotUrl[]> {
    if (!this.profile) throw new Error();

    // delete removed online images
    const remainedIds = images.filter((img) => 'id' in img).map((img) => img.id);
    const removedImages =
      this.profile.studioShotsUrls.filter((img) => !remainedIds.includes(img.id)) ?? [];

    if (removedImages.length) {
      await this.bulkDeleteImages(removedImages);
    }

    // upload / update new studo shots
    // get the name of the last existing studo shot to start naming new images at that point
    const lastId = parseInt(remainedIds.sort((a, b) => a.localeCompare(b)).at(-1) ?? '0');
    return this.uploadStudioShots(images, lastId);
  }

  private async uploadStudioShots(
    images: (StudioShotUrl | LocalStudioShotImage)[],
    lastId: number,
  ): Promise<StudioShotUrl[]> {
    const uploadPromises = images.map(async (img, i) => {
      const order = i + 1;

      if ('id' in img) {
        // already online, just update order
        img.order = order;
      } else {
        // upload new image
        const id = (++lastId).toString();

        img = {
          id,
          order,
          url: await this.compressAndUpload(img.file, id),
        };
      }

      return img;
    });

    return Promise.all(uploadPromises);
  }

  private async uploadImage(img: File, id: string): Promise<string> {
    const imageRef = this.getImageRef(id);
    const result = await uploadBytes(imageRef, img);
    return getDownloadURL(result.ref);
  }

  private compressImage(img: File): Promise<File> {
    return imageCompression(img, {
      maxSizeMB: 1,
      maxWidthOrHeight: 3000,
      fileType: 'image/webp',
      alwaysKeepResolution: true,
    });
  }

  private getProfileRef(): DocumentReference {
    return doc(this.db, 'profile/shahrazad');
  }

  private getImageRef(id: string): StorageReference {
    return ref(this.storage, `profile/${id}`);
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
