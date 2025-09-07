import { Component, ElementRef, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { ShariButton } from '../../../../shared/components/button/shari-button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PaintingsService } from '../../../../shared/services/paintings';
import { Snackbar } from '../../../../shared/components/snackbar';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'shari-order-modal',
  imports: [ShariButton, MatProgressSpinner, FormsModule],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.scss'
})
export class OrderModal implements OnInit {
  paintingsService = inject(PaintingsService);
  snackbar = inject(Snackbar);

  orderInput = viewChild.required<ElementRef<HTMLInputElement>>('orderInput');
  painting = input.required<Painting>();
  close = output<void>();

  inputValue = '';
  isLoading = signal(false);

  ngOnInit(): void {
    this.populateInput();
  }

  populateInput(): void {
    this.inputValue = this.painting().order.toString();
    this.orderInput().nativeElement.focus();
  }

  async onSaveClick(): Promise<void> {
    if (!this.inputValue) return;

    const newOrder = Number(this.inputValue);
    if (newOrder === this.painting().order) {
      this.closeModal();
      return;
    }

    this.isLoading.set(true);

    try {
      await this.paintingsService.updatePaintingsOrder(this.painting().id, newOrder);

      this.snackbar.show('New Order Saved');
      this.closeModal();

    } catch (err: unknown) {
      this.snackbar.show('Reorder Failed', 'red');

    } finally {
      this.isLoading.set(false);
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
