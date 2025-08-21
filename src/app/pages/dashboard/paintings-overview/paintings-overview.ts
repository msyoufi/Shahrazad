import { Component, inject } from '@angular/core';
import { ShariButton } from "../../../shared/components/button/shari-button";
import { PaintingsService } from '../../../shared/services/paintings';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'shari-paintings-overview',
  imports: [RouterLink, ShariButton],
  templateUrl: './paintings-overview.html',
  styleUrl: './paintings-overview.scss'
})
export class PaintingsOverview {
  paintingsService = inject(PaintingsService);
  router = inject(Router);

  onAddClick(): void {
    this.router.navigateByUrl('/dashboard-1975/painting/new');
  }
}
