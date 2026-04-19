import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ShariButton } from '../button/shari-button';
import { PaintingsService } from '../../services/paintings';
import { Snackbar } from '../snackbar';
import { OrderModalService } from './order-modal-service';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'shari-order-modal',
  imports: [ShariButton, MatProgressSpinner, FormsModule],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.scss',
})
export class OrderModal implements OnInit {
  paintingsService = inject(PaintingsService);
  modalService = inject(OrderModalService);
  snackbar = inject(Snackbar);

  orderInput = viewChild.required<ElementRef<HTMLInputElement>>('orderInput');
  painting = computed(() => this.modalService.selectedPainting!);

  inputValue = 0;
  isLoading = signal(false);
  orderRange = computed(() => `(1 - ${this.paintingsService.paintings.length})`);

  ngOnInit(): void {
    this.populateInput();
  }

  populateInput(): void {
    this.inputValue = this.painting().order;
    this.orderInput().nativeElement.focus();
  }

  async onSaveClick(): Promise<void> {
    if (!this.orderInput().nativeElement.checkValidity()) return;

    const newOrder = this.inputValue;
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
    this.modalService.closeModal();
  }
}
