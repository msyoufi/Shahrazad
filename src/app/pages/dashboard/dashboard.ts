import { Component, inject, signal } from '@angular/core';
import { PaintingForm } from './painting-form/painting-form';
import { ShariButton } from "../../shared/components/button/shari-button";
import { PaintingFormService } from './painting-form/painting-form.service';

@Component({
  selector: 'shari-dashboard',
  imports: [PaintingForm, ShariButton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  paintingFormService = inject(PaintingFormService);

  openForm(): void {
    this.paintingFormService.openForm();
  }
}
