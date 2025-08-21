import { Component, DestroyRef, effect, HostListener, inject, signal } from '@angular/core';
import { PaintingsService } from '../../shared/services/paintings';
import { RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'shari-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  paintingsService = inject(PaintingsService);
  breakpointObserver = inject(BreakpointObserver);
  destroyRef = inject(DestroyRef);

  paintingsColumns = signal<Painting[][]>([]);
  columnsCount = signal(3);
  page = signal(1);

  lastPage = 0;
  perPage: number = 2;

  constructor() {
    this.getLastPageNum();
    this.arrangePaintingsInColumns();
    this.subscribeToScreenResize();
  }

  getLastPageNum(): void {
    effect(() => {
      this.lastPage = Math.ceil(this.paintingsService.paintings.length / this.perPage);
    });
  }

  arrangePaintingsInColumns(): void {
    effect(() => {
      const allPaintings = this.paintingsService.paintings;
      if (!allPaintings.length) return;

      const colCount = this.columnsCount();
      const paintingsCols: Painting[][] = Array.from({ length: colCount }, () => []);
      const end = this.perPage * this.page();
      const batch = allPaintings.slice(0, end);

      let i = 0;
      for (const item of batch) {
        if (i >= colCount) i = 0;

        paintingsCols[i].push(item);
        i++;
      }

      this.paintingsColumns.set(paintingsCols);
    });
  }

  subscribeToScreenResize(): void {
    this.breakpointObserver.observe(['(max-width: 850px)', '(max-width: 450px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        let nextCount = 3;
        const { '(max-width: 450px)': small, '(max-width: 850px)': medium } = result.breakpoints;

        if (medium) nextCount = 2;
        if (small) nextCount = 1;

        this.columnsCount.set(nextCount);
      });
  }

  private scrollThrottled = false;

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.scrollThrottled) return;

    this.scrollThrottled = true;
    setTimeout(() => this.scrollThrottled = false, 100);

    const currPage = this.page();
    if (currPage >= this.lastPage) return;

    const isViewEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 400;
    if (!isViewEnd) return;

    this.page.set(currPage + 1);
  }
}
