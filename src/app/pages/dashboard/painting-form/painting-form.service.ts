import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaintingFormService {
  private open = signal(false);
  private paintingData = signal<Painting | undefined>(undefined);

  get isOpen(): boolean {
    return this.open();
  }

  get painting(): Painting | undefined {
    return this.paintingData();
  }

  openForm(painting?: Painting): void {
    this.paintingData.set(painting);
    this.open.set(true);
  }

  closeForm(): void {
    this.open.set(false);
    this.paintingData.set(undefined);
  }
}
