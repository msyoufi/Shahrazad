import { Component, computed, effect, inject, Input, signal } from '@angular/core';
import { PaintingsService } from '../../shared/services/paintings';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Swipe } from '../../shared/directives/swipe';

@Component({
  selector: 'shari-painting-details',
  imports: [MatProgressSpinner, Swipe],
  templateUrl: './painting-details.html',
  styleUrl: './painting-details.scss'
})
export class PaintingDetails {
  paintingsService = inject(PaintingsService);

  @Input() set id(id: string) {
    this.paintingId.set(id);
  }

  // use a computed signal for the painting in case the the paintings in the paintingsservice are still loading.
  paintingId = signal('');
  painting = computed<Painting | undefined>(() =>
    this.paintingsService.paintings.find(p => p.id === this.paintingId())
  );

  currentImageUrl = signal('');
  isLoading = signal(false);
  controlsVisible = signal(false);
  private timeoutId: any;

  // the index of the current image matches the image's order (main image index = 0).
  private currentIndex = 0;

  isFocusMode = signal(false);

  constructor() {
    effect(() => {
      const mainImageUrl = this.painting()?.main_image.large ?? '';
      this.setImageUrl(mainImageUrl, 0);
    });
  }

  onImageSelect(nextUrl: string, index: number): void {
    if (nextUrl === this.currentImageUrl()) return;
    this.setImageUrl(nextUrl, index);
    this.controlsVisible.set(false);
  }

  onImageSwipe(direction: 'left' | 'right'): void {
    this.showControls();

    const painting = this.painting();
    if (!painting) return;

    const allImages = [painting.main_image].concat(painting.close_ups);

    const nextIndex = direction === 'left'
      ? this.currentIndex + 1
      : this.currentIndex - 1;

    if (nextIndex >= allImages.length || nextIndex < 0)
      return;

    const nextUrl = allImages.find(img => img.order === nextIndex)!.large;
    this.setImageUrl(nextUrl, nextIndex);
  }

  private setImageUrl(nextUrl: string, nextIndex: number): void {
    this.isLoading.set(true);
    this.currentImageUrl.set(nextUrl);
    this.currentIndex = nextIndex;
  }

  showControls() {
    this.controlsVisible.set(true);

    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.controlsVisible.set(false), 2000);
  }

  onImageViewClick() {
    this.controlsVisible.set(false);
    this.isFocusMode.set(true);
  }

  onFocusContainerClick(event: MouseEvent) {
    event.stopPropagation();

    const targetId = (event.target as HTMLElement).id;
    if (targetId === 'focus_overlay') {
      this.closeFocusMode();
    }
  }

  closeFocusMode() {
    this.isFocusMode.set(false);
  }
}