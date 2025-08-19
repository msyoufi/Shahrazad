import { Component, inject } from '@angular/core';
import { ShariButton } from "../../../shared/components/button/shari-button";
import { PaintingFormService } from './painting-form/painting-form.service';
import { PaintingsService } from '../../../shared/services/paintings';
import { PaintingForm } from "./painting-form/painting-form";
import { CloseupForm } from './closeup-form/closeup-form';
import { CloseupFormService } from './closeup-form/closeup-form.service';

@Component({
  selector: 'shari-paintings-overview',
  imports: [ShariButton, PaintingForm, CloseupForm],
  templateUrl: './paintings-overview.html',
  styleUrl: './paintings-overview.scss'
})
export class PaintingsOverview {
  paintingFormService = inject(PaintingFormService);
  closeupFormService = inject(CloseupFormService);
  paintingsService = inject(PaintingsService);

  openPaintingForm(painting?: Painting): void {
    this.paintingFormService.openForm(painting);
  }

  openClosupForm(painting: Painting): void {
    this.closeupFormService.openForm(painting);
  }

  async onRemoveClick(paintingId: string): Promise<void> {
    console.log(paintingId)
  }
}
