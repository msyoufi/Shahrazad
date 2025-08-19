import { Dialog, DialogRef, } from '@angular/cdk/dialog';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from './confirmation-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);

  async open(data: ConfirmationDialogData): Promise<boolean | undefined> {
    const dialogRef: DialogRef<boolean | undefined, ConfirmationDialog> =
      this.dialog.open(ConfirmationDialog, { data });

    const source = dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef))
    return await firstValueFrom(source);
  }
}