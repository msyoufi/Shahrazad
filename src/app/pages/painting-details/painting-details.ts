import { Component, computed, effect, HostListener, inject, Input, signal } from '@angular/core';
import { PaintingsService } from '../../shared/services/paintings';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Swipe } from '../../shared/directives/swipe';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth';
import { SwipeButtons } from './swipe-buttons/swipe-buttons';

type ImageUrlsWithLoading = ImageUrls & {
  loading_large: boolean;
  loading_thumb: boolean;
};

@Component({
  selector: 'shari-painting-details',
  imports: [MatProgressSpinner, Swipe, CurrencyPipe, RouterLink, SwipeButtons],
  templateUrl: './painting-details.html',
  styleUrl: './painting-details.scss',
})
export class PaintingDetails {
  paintingsService = inject(PaintingsService);
  authService = inject(AuthService);

  @Input() set id(id: string) {
    this.paintingId.set(id);
  }

  paintingId = signal('');
  painting = computed<Painting | undefined>(() =>
    this.paintingsService.paintings.find((p) => p.id === this.paintingId()),
  );

  allImages = computed<ImageUrlsWithLoading[]>(() => {
    const pt = this.painting();
    if (!pt) return [];

    return [pt.main_image, ...pt.close_ups].map((img) => ({
      ...img,
      loading_large: true,
      loading_thumb: true,
    }));
  });

  currentImgId = signal('');
  currentImgNum = computed(
    () => (this.allImages().find((img) => img.id === this.currentImgId())?.order ?? 0) + 1,
  );

  controlsVisible = signal(false);
  private timeoutId: any;

  isFocusMode = signal(false);

  constructor() {
    effect(() => {
      // Load the main image by default
      const mainImgId = this.painting()?.main_image.id ?? '';
      this.currentImgId.set(mainImgId);
    });

    effect(() => this.toggleScroll());
  }

  onThumbnailClick(nextImgId: string): void {
    this.currentImgId.set(nextImgId);
    this.controlsVisible.set(false);
  }

  setNextImage(delta: -1 | 1): void {
    this.showControls();

    const images = this.allImages();
    const currentIndex = images.findIndex((img) => img.id === this.currentImgId());
    const nextIndex = (currentIndex + delta + images.length) % images.length;

    let nextImgId = images[nextIndex].id;
    this.currentImgId.set(nextImgId);
  }

  showControls() {
    this.controlsVisible.set(true);

    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.controlsVisible.set(false), 2000);
  }

  onImageViewClick() {
    this.isFocusMode.set(true);
    this.showControls();
  }

  onFocusContainerClick(event: MouseEvent) {
    event.stopPropagation();

    const targetId = (event.target as HTMLElement).id;
    if (targetId === 'focus_overlay') {
      this.closeFocusMode();
    }
  }

  toggleScroll() {
    if (this.isFocusMode()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeFocusMode() {
    this.isFocusMode.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.closeFocusMode();
        break;
      case 'ArrowLeft':
        this.setNextImage(-1);
        break;
      case 'ArrowRight':
        this.setNextImage(1);
        break;
    }
  }
}
