import { inject, Injectable } from '@angular/core';
import { doc, DocumentReference, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HomeHeroService {
  private db = inject(Firestore);

  async getHeroContent(): Promise<HomeHero | undefined> {
    const heroContent = await getDoc(this.getHeroDoc());
    return heroContent.data() as HomeHero | undefined;
  }

  updateHeroContent(newData: Partial<HomeHero>): Promise<void> {
    return updateDoc(this.getHeroDoc(), newData);
  }

  private getHeroDoc(): DocumentReference {
    return doc(this.db, 'home/hero');
  }
}