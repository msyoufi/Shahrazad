import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrderModalService } from '../../../../shared/components/order-modal/order-modal-service';

@Component({
  selector: 'shari-painting-item',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './painting-item.html',
  styleUrl: './painting-item.scss',
})
export class PaintingItem {
  orderModalService = inject(OrderModalService);
  router = inject(Router);

  painting = input.required<Painting>();
  isLoading = signal(true);

  onOrderButtonClick(e: MouseEvent, painting: Painting) {
    e.preventDefault();
    e.stopPropagation();

    this.orderModalService.openModal(painting);
  }

  onImageClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.router.navigateByUrl(`/painting/${this.painting().id}`);
  }
}
