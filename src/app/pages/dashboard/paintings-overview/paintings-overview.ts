import { Component, inject } from '@angular/core';
import { ShariButton } from "../../../shared/components/button/shari-button";
import { PaintingFormService } from './painting-form/painting-form.service';
import { PaintingsService } from '../../../shared/services/paintings';
import { PaintingForm } from "./painting-form/painting-form";

@Component({
  selector: 'shari-paintings-overview',
  imports: [ShariButton, PaintingForm],
  templateUrl: './paintings-overview.html',
  styleUrl: './paintings-overview.scss'
})
export class PaintingsOverview {
  paintingFormService = inject(PaintingFormService);
  paintingsService = inject(PaintingsService);

  openForm(painting?: Painting): void {
    this.paintingFormService.openForm(painting);
  }

  async onRemoveClick(paintingId: string): Promise<void> {
    console.log(paintingId)
  }
}
