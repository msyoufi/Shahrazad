import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { collection, doc, Firestore, onSnapshot, orderBy, query, Unsubscribe, DocumentReference, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';

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

  createPainting(painting: Painting): Promise<void> {
    const { id, ...paintingData } = painting;
    return setDoc(this.getDocRef(id), paintingData);
  }

  updatePainting(newData: PaintingUpdate): Promise<void> {
    const { id, ...paintingData } = newData;
    return updateDoc(this.getDocRef(id), paintingData);
  }

  deletePainting(id: string): Promise<void> {
    return deleteDoc(this.getDocRef(id));
  }

  private getDocRef(id: string): DocumentReference {
    return doc(this.db, 'paintings/' + id);
  }

  ngOnDestroy(): void {
    this.unsubscribe && this.unsubscribe();
  }
}