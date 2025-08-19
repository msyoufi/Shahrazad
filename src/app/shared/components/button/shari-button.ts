import { Component, input, output } from '@angular/core';

@Component({
  selector: 'shari-button',
  imports: [],
  template: `
    <button 
      [type]="type()" 
      [class]="'shari-button ' + variant() + ' ' + color() + ' ' + class()"
      [class.loading]='loading()'
      (click)="handleClick()"
      [disabled]="disabled()"
      >
      <ng-content />
    </button>
    `,
  styleUrl: './shari-button.scss'
})
export class ShariButton {
  variant = input<'filled' | 'outlined'>('filled');
  color = input<'primary' | 'secondary' | 'red' | 'green'>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  class = input<string>('');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  onClick = output<void>();

  handleClick(): void {
    this.onClick.emit();
  }
}
