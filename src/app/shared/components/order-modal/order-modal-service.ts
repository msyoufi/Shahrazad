import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderModalService {
  private painting = signal<Painting | null>(null);

  get selectedPainting() {
    return this.painting();
  }

  openModal(painting: Painting): void {
    this.painting.set(painting);
  }

  closeModal(): void {
    this.painting.set(null);
  }
}
