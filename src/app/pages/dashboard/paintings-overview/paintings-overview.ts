import { Component, inject } from '@angular/core';
import { ShariButton } from "../../../shared/components/button/shari-button";
import { PaintingFormService } from '../painting-form/painting-form.service';
import { Paintings } from '../../../shared/services/paintings';

@Component({
  selector: 'shari-paintings-overview',
  imports: [ShariButton],
  templateUrl: './paintings-overview.html',
  styleUrl: './paintings-overview.scss'
})
export class PaintingsOverview {
  paintingFormService = inject(PaintingFormService);
  paintingsService = inject(Paintings);

  openForm(): void {
    this.paintingFormService.openForm();
  }
}
