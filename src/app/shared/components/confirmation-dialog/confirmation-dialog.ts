import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { ShariButton } from '../button/shari-button';

@Component({
  selector: 'shari-confirmation-dialog',
  imports: [ShariButton],
  template: `
    <p class="title">{{title}}</p>
    <p class="message">{{message}}</p>
    <div class="buttons-box">
      <shari-button type="button" variant="outlined" (onClick)="dialogRef.close(false)">
        Cancel
      </shari-button>
      <shari-button type="button" color="red" (onClick)="dialogRef.close(true)">
        {{actionButton}}
      </shari-button>
    </div>
  `,
  styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialog {
  title = '';
  message = '';
  actionButton = 'Confirm';

  constructor(
    public dialogRef: DialogRef<boolean, undefined>,
    @Inject(DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    this.title = data.title;
    this.message = data.message;
    this.actionButton = data.actionButton;
  }
}
