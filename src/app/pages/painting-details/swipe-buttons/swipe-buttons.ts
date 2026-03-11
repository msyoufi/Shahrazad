import { Component, input, output } from '@angular/core';

@Component({
  selector: 'shari-swipe-buttons',
  imports: [],
  templateUrl: './swipe-buttons.html',
  styleUrl: './swipe-buttons.scss',
})
export class SwipeButtons {
  controlsVisible = input.required<boolean>();
  onClick = output<1 | -1>();
}
