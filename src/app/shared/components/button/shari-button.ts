import { Component, input, output } from '@angular/core';

@Component({
  selector: 'shari-button',
  imports: [],
  template: `
    <button 
      [type]="type()" 
      [class]="'shari-button ' + variant() + ' ' + color() + ' ' + class()"
      (click)="onClick()"
      [disabled]="disabled()"
      >
        {{text()}}
    </button>
    `,
  styleUrl: './shari-button.scss'
})
export class ShariButton {
  text = input.required<string>();
  variant = input<'filled' | 'outlined'>('filled');
  color = input<'primary' | 'secondary' | 'red' | 'green'>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  class = input<string>('');
  disabled = input<boolean>(false);

  click = output<void>();

  onClick(): void {
    this.click.emit();
  }
}
