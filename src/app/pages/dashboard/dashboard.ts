import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'shari-dashboard',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  currentTab = signal('');

  constructor() {
    this.listenToPathChnages();
  }

  listenToPathChnages(): void {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if (e instanceof NavigationEnd) {
          const path = e.url.split('/').at(-1) ?? '';
          this.currentTab.set(path);
        }
      });
  }
}
