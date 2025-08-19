import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { collection, Firestore, onSnapshot, orderBy, query, Unsubscribe } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class Paintings implements OnDestroy {
  private db = inject(Firestore);

  private paintingsCollection = collection(this.db, 'paintings');
  private paintings$ = signal<Painting[]>([]);

  private unsubscribe: Unsubscribe | undefined;

  constructor() {
    this.subscribeToChanges();
  }

  get paintings(): Painting[] {
    return this.paintings$();
  }

  subscribeToChanges(): void {
    try {
      const q = query(this.paintingsCollection, orderBy('order'));

      this.unsubscribe = onSnapshot(q, querySnapshot => {
        const paintings: Painting[] = [];
        querySnapshot.forEach(doc => paintings.push({ ...doc.data(), id: doc.id } as Painting));
        this.paintings$.set(paintings);
      });

    } catch (err: unknown) {
      console.log(err);
    }
  }

  private unsubscriebeToChanges(): void {
    this.unsubscribe && this.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscriebeToChanges();
  }
}