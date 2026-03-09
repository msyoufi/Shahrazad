import { Component } from '@angular/core';

@Component({
  selector: 'shari-painting-item-loader',
  imports: [],
  template: `
    <div class="painting-loader">
      <div class="skeleton"></div>
      <div class="data">
        <p class="skeleton long"></p>
        <p class="skeleton"></p>
        <p class="skeleton"></p>
        <p class="skeleton"></p>
      </div>
    </div>
  `,
  styles: `
    .painting-loader {
      display: grid;
      grid-template-columns: 30% auto;
      height: 9rem;
      padding: 0.5rem;
      gap: 1rem;
      align-items: center;
      border-radius: var(--radius);
      border: 2px solid var(--border-color);
    }

    .data {
      display: grid;
      align-content: center;
      gap: 0.5rem;
      height: 100%;

      .skeleton {
        width: 50%;
        height: 0.5rem;

        &.long {
          width: 70%;
        }
      }
    }
  `,
})
export class PaintingItemLoader {}
