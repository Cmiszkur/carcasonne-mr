import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationButtonData } from 'src/app/game/models/confirmationButtonData';
import { NoPawnConfirmationDialogWindowComponent } from './no-pawn-confirmation-dialog-window/no-pawn-confirmation-dialog-window.component';

@Component({
  selector: 'app-tile-and-pawn-confirmation-button',
  templateUrl: './tile-and-pawn-confirmation-button.html',
  styleUrls: ['./tile-and-pawn-confirmation-button.sass'],
})
export class TileAndPawnConfirmationButtonComponent {
  @Input() public isTilePlacedCorrectly: boolean;
  /**
   * Indicates confirmation of tile placement. Based on this variable possible pawn placements are determined.
   */
  @Input() public tilePlacementConfirmed: boolean;
  @Input() public pawnPlaced: boolean;
  @Output() public confirmation: EventEmitter<ConfirmationButtonData> = new EventEmitter();

  constructor(public dialog: MatDialog) {
    this.confirmation = new EventEmitter<ConfirmationButtonData>();
    this.isTilePlacedCorrectly = false;
    this.tilePlacementConfirmed = false;
    this.pawnPlaced = false;
  }

  public confirmChoice(): void {
    if (this.isTilePlacedCorrectly) {
      console.log('this.tilePlacementConfirmed', this.tilePlacementConfirmed, this.pawnPlaced);
      if (this.tilePlacementConfirmed) {
        if (this.pawnPlaced) {
          this.confirmation.emit({ tilePlaced: true, pawnPlaced: true });
        } else {
          this.openDialog();
        }
      } else {
        this.confirmation.emit({ tilePlaced: true });
      }
    }
  }

  private openDialog(): void {
    const dialogRef: MatDialogRef<NoPawnConfirmationDialogWindowComponent, boolean> = this.dialog.open(
      NoPawnConfirmationDialogWindowComponent
    );
    this.listenForDialogClosing(dialogRef);
  }

  /**
   * If dialog closes returning:
   * * true - tile will be send to backend without pawn placed
   * * false - nothing will happen
   * @param dialogRef
   */
  private listenForDialogClosing(dialogRef: MatDialogRef<NoPawnConfirmationDialogWindowComponent, boolean>): void {
    dialogRef.afterClosed().subscribe(sendTileWithoutPawn => {
      if (sendTileWithoutPawn) {
        this.confirmation.emit({ tilePlaced: true, pawnPlaced: false });
      }
    });
  }
}
