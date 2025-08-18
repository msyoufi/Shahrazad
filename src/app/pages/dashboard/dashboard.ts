import { Component } from '@angular/core';
import { PaintingForm } from './painting-form/painting-form';

@Component({
  selector: 'shari-dashboard',
  imports: [PaintingForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
