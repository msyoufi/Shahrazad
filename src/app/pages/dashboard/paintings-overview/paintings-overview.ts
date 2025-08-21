import { Component, effect, inject, signal } from '@angular/core';
import { ShariButton } from "../../../shared/components/button/shari-button";
import { PaintingsService } from '../../../shared/services/paintings';
import { Router, RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'shari-paintings-overview',
  imports: [RouterLink, ShariButton, MatPaginatorModule],
  templateUrl: './paintings-overview.html',
  styleUrl: './paintings-overview.scss'
})
export class PaintingsOverview {
  paintingsService = inject(PaintingsService);
  router = inject(Router);

  paintings = signal<Painting[]>([]);
  pageIndex = signal(0);
  pageSize = signal(10);

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
      const end = this.pageIndex() + this.pageSize();

      const paginated = this.paintingsService.paintings.slice(this.pageIndex(), end);
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
}
