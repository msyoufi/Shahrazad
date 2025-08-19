import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'shari-dashboard',
  imports: [RouterOutlet, RouterLink,],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  router = inject(Router);

  currentTab = signal('');

  constructor() {
    this.getCurrentPath();
  }

  getCurrentPath(): void {
    const path = this.router.url.split('/').at(-1) ?? '';
    this.currentTab.set(path);
  }
}
