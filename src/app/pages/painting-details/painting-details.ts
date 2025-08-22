import { Component, computed, effect, inject, Input, signal } from '@angular/core';
import { PaintingsService } from '../../shared/services/paintings';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'shari-painting-details',
  imports: [MatProgressSpinner],
  templateUrl: './painting-details.html',
  styleUrl: './painting-details.scss'
})
export class PaintingDetails {
  paintingsService = inject(PaintingsService);

  @Input() set id(id: string) {
    this.paintingId.set(id);
  }

  paintingId = signal('');
  painting = computed<Painting | undefined>(() =>
    this.paintingsService.paintings.find(p => p.id === this.paintingId())
  );

  currentImage = signal('');
  isLoading = signal(false);

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      const mainImageUrl = this.painting()?.main_image.large;
      this.currentImage.set(mainImageUrl ?? '');
    });
  }

  onImageClick(nextUrl: string): void {
    if (nextUrl === this.currentImage()) return;
    this.isLoading.set(true);
    this.currentImage.set(nextUrl);
  }
}
