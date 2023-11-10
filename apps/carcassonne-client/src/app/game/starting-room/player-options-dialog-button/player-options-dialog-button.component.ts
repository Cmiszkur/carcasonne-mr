import { PlayerOptions } from 'src/app/game/models/Room';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PlayerOptionsDialogWindowComponent } from './player-options-dialog-window/player-options-dialog-window.component';
import { PlayerOptionsData } from '../../models/dialogWindowData';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-player-options-dialog-button',
  templateUrl: './player-options-dialog-button.component.html',
  styleUrls: ['./player-options-dialog-button.component.sass'],
})
export class PlayerOptionsDialogButtonComponent {
  /**
   * Text inside a button.
   */
  @Input() public text: string;
  @Output() public playerOptions: EventEmitter<PlayerOptions>;

  constructor(public dialog: MatDialog, private roomService: RoomService) {
    this.playerOptions = new EventEmitter<PlayerOptions>();
    this.text = '';
  }

  public openDialog(): void {
    const dialogRef: MatDialogRef<PlayerOptionsDialogWindowComponent, PlayerOptionsData> = this.dialog.open(
      PlayerOptionsDialogWindowComponent,
      {
        data: { playerOptions: { color: null }, shortenedRoom: this.roomService.selectedRoom },
      }
    );
    this.listenForDialogClosing(dialogRef);
  }

  private listenForDialogClosing(dialogRef: MatDialogRef<PlayerOptionsDialogWindowComponent, PlayerOptionsData>): void {
    dialogRef.afterClosed().subscribe(result => this.playerOptions.emit(result?.playerOptions));
  }
}
