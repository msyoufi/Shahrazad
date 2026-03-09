import { CurrencyPipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'shari-painting-item',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './painting-item.html',
  styleUrl: './painting-item.scss',
})
export class PaintingItem {
  painting = input.required<Painting>();
  isLoading = signal(true);
  orderButtonClick = output<Painting>();

  onOrderButtonClick(e: MouseEvent, painting: Painting) {
    e.preventDefault();
    e.stopPropagation();

    this.orderButtonClick.emit(painting);
  }
}
