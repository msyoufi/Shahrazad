import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { collection, doc, Firestore, onSnapshot, orderBy, query, Unsubscribe, DocumentReference, setDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PaintingsService implements OnDestroy {
  private db = inject(Firestore);

  private paintings$ = signal<Painting[]>([]);

  private unsubscribe: Unsubscribe | undefined;

  get paintings(): Painting[] {
    return this.paintings$();
  }

  constructor() {
    this.subscribeToChanges();
  }

  private subscribeToChanges(): void {
    try {
      const q = query(collection(this.db, 'paintings'), orderBy('order'));

      this.unsubscribe = onSnapshot(q, querySnapshot => {
        const paintings: Painting[] = [];
        querySnapshot.forEach(doc => paintings.push({ ...doc.data(), id: doc.id } as Painting));
        this.paintings$.set(paintings);
      });

    } catch (err: unknown) {
      console.log(err);
    }
  }

  async createPainting(painting: Painting): Promise<void> {
    const { id, ...paintingData } = painting;
    return setDoc(this.getDocRef(id), paintingData);
  }

  async updatePainting(id: string, newData: Partial<Painting>): Promise<void> {
    return updateDoc(this.getDocRef(id), newData);
  }

  private getDocRef(id: string): DocumentReference {
    return doc(this.db, 'paintings/' + id);
  }

  ngOnDestroy(): void {
    this.unsubscribe && this.unsubscribe();
  }
}