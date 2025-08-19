import { Component, inject, signal } from '@angular/core';
import { PaintingForm } from './painting-form/painting-form';
import { PaintingFormService } from './painting-form/painting-form.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { PaintingsService } from '../../shared/services/paintings';
import { ShariButton } from "../../shared/components/button/shari-button";

@Component({
  selector: 'shari-dashboard',
  imports: [PaintingForm, RouterOutlet, RouterLink, ShariButton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  router = inject(Router);
  paintingsService = inject(PaintingsService);
  paintingFormService = inject(PaintingFormService);

  currentTab = signal('');

  constructor() {
    this.getCurrentPath();
  }

  getCurrentPath(): void {
    const path = this.router.url.split('/').at(-1) ?? '';
    this.currentTab.set(path);
  }

}
