import { Component, effect, inject, signal } from '@angular/core';
import { ShariButton } from '../../../shared/components/button/shari-button';
import { PaintingsService } from '../../../shared/services/paintings';
import { Router, RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderModal } from './order-modal/order-modal';
import { PaintingItem } from './painting-item/painting-item';
import { PaintingItemLoader } from './painting-item/painting-item-loader';

@Component({
  selector: 'shari-paintings-overview',
  imports: [
    RouterLink,
    ShariButton,
    MatPaginatorModule,
    OrderModal,
    PaintingItem,
    PaintingItemLoader,
  ],
  templateUrl: './paintings-overview.html',
  styleUrl: './paintings-overview.scss',
})
export class PaintingsOverview {
  paintingsService = inject(PaintingsService);
  router = inject(Router);

  paintings = signal<Painting[]>([]);
  pageIndex = signal(0);
  pageSize = signal(10);

  loadersCount = Array.from({ length: this.pageSize() });

  selectedPainting = signal<Painting | null>(null);

  constructor() {
    this.setInitialPageSize();
    this.paginatePaintings();
  }

  setInitialPageSize(): void {
    const savedPageSize = JSON.parse(localStorage.getItem('pageSize') ?? '10');
    this.pageSize.set(savedPageSize);
  }

  paginatePaintings(): void {
    effect(() => {
      const start = this.pageIndex() * this.pageSize();
      const end = start + this.pageSize();

      const paginated = this.paintingsService.paintings.slice(start, end);
      this.paintings.set(paginated);
    });
  }

  onPageChange(e: PageEvent): void {
    const { pageIndex, pageSize } = e;

    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);

    localStorage.setItem('pageSize', JSON.stringify(pageSize));
  }

  onAddClick(): void {
    this.router.navigateByUrl('/dashboard-1975/painting/new');
  }

  openOrderModal(painting: Painting): void {
    this.selectedPainting.set(painting);
  }

  closeOrderModal(): void {
    this.selectedPainting.set(null);
  }
}
