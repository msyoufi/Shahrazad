import { inject, Injectable } from '@angular/core';
import { doc, Firestore, DocumentReference, updateDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private db = inject(Firestore);

  async getProfile(): Promise<Profile | undefined> {
    const profile = await getDoc(this.getProfileRef());
    return profile.data() as Profile | undefined;
  }

  updateProfile(newData: Partial<Profile>): Promise<void> {
    return updateDoc(this.getProfileRef(), newData);
  }

  private getProfileRef(): DocumentReference {
    return doc(this.db, 'profile/shahrazad');
  }
}