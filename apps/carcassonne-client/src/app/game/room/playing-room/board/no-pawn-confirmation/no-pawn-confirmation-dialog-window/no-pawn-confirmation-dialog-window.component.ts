import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-no-pawn-confirmation-dialog-window',
  templateUrl: './no-pawn-confirmation-dialog-window.component.html',
  styleUrls: ['./no-pawn-confirmation-dialog-window.component.sass'],
})
export class NoPawnConfirmationDialogWindowComponent {
  constructor(
    public dialogRef: MatDialogRef<NoPawnConfirmationDialogWindowComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: boolean
  ) {}
}
