import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CloseupFormService {
  private open = signal(true);
  private paintingData = signal<Painting | null>(null);

  get isOpen(): boolean {
    return this.open();
  }

  get painting(): Painting | null {
    return this.paintingData();
  }

  openForm(painting: Painting): void {
    this.paintingData.set(painting);
    this.open.set(true);
  }

  closeForm(): void {
    this.open.set(false);
    this.paintingData.set(null);
  }
}
