import { Component, inject } from '@angular/core';
import { PaintingForm } from './painting-form/painting-form';
import { PaintingFormService } from './painting-form/painting-form.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'shari-dashboard',
  imports: [PaintingForm, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  paintingFormService = inject(PaintingFormService);

}
