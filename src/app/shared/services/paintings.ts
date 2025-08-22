import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { collection, doc, Firestore, onSnapshot, orderBy, query, Unsubscribe, DocumentReference, setDoc, updateDoc, deleteDoc, writeBatch } from '@angular/fire/firestore';

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

  updatePaintingsOrder(paintingId: string, newOrder: number, isDelete: boolean = false): Promise<void> {
    const list = this.paintings.slice();

    const index = list.findIndex(p => p.id === paintingId);
    if (index < 0) throw new Error();

    const [moved] = list.splice(index, 1);

    if (!isDelete) {
      const newIndex = Math.max(0, Math.min(newOrder - 1, list.length));
      list.splice(newIndex, 0, moved);
    }

    return this.writeNewOrder(list);
  }

  private writeNewOrder(paintings: Painting[]): Promise<void> {
    const batch = writeBatch(this.db);

    paintings.forEach((p, i) =>
      batch.update(this.getDocRef(p.id), { order: i + 1 })
    );

    return batch.commit();
  }

  private getDocRef(id: string): DocumentReference {
    return doc(this.db, 'paintings/' + id);
  }

  ngOnDestroy(): void {
    this.unsubscribe && this.unsubscribe();
  }
}