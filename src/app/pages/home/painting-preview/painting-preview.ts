import { Component, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth';
import { OrderModalService } from '../../../shared/components/order-modal/order-modal-service';

@Component({
  selector: 'shari-painting-preview',
  imports: [RouterLink],
  templateUrl: './painting-preview.html',
  styleUrl: './painting-preview.scss',
})
export class PaintingPreview {
  authService = inject(AuthService);
  orderModalService = inject(OrderModalService);

  painting = input.required<Painting>();
  imgRef = viewChild.required<ElementRef<HTMLImageElement>>('imgRef');

  elementHeight = signal(0);
  isLoading = signal(true);

  constructor() {
    effect(() => this.calculateElementHeight());
  }

  calculateElementHeight() {
    const elementWidth = this.imgRef().nativeElement.clientWidth;
    const { width, height } = this.painting();

    this.elementHeight.set(elementWidth * (width / height));
  }

  onOrderButtonClick(e: MouseEvent, painting: Painting) {
    e.preventDefault();
    e.stopPropagation();

    this.orderModalService.openModal(painting);
  }
}
