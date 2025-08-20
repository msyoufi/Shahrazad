import { Component, input } from '@angular/core';

@Component({
  selector: 'shari-password-toggle',
  imports: [],
  template: `
    <button type="button" (click)="onClick()">
      {{input().type === 'password' ? 'Show' : 'Hide'}}
    </button>
  `,
  styles: `
    button{
      width: fit-content;
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray);
    }
  `
})
export class PasswordToggle {
  input = input.required<HTMLInputElement>();

  onClick(): void {
    const nextType = this.input().type === 'password' ? 'text' : 'password';
    this.input().setAttribute('type', nextType);
  }
}