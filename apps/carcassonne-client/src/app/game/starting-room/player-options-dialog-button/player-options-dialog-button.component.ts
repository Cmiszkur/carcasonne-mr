import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PlayerOptionsDialogWindowComponent } from './player-options-dialog-window/player-options-dialog-window.component';
import { PlayerOptionsData } from '../../models/dialogWindowData';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShortenedRoom } from '@carcasonne-mr/shared-interfaces';
import { filter, tap } from 'rxjs/operators';
import { isNotNullish } from '@shared-functions';

@Component({
  selector: 'app-player-options-dialog-button',
  templateUrl: './player-options-dialog-button.component.html',
  styleUrls: ['./player-options-dialog-button.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerOptionsDialogButtonComponent {
  private destroyRef = inject(DestroyRef);
  /**
   * Text inside a button.
   */
  @Input() public text: string;
  @Input() public selectedRoom: ShortenedRoom | null = null;
  @Output() public playerOptions: EventEmitter<PlayerOptionsData>;

  constructor(public dialog: MatDialog) {
    this.playerOptions = new EventEmitter<PlayerOptionsData>();
    this.text = '';
  }

  public openDialog(): void {
    const dialogRef: MatDialogRef<PlayerOptionsDialogWindowComponent, PlayerOptionsData> =
      this.dialog.open(PlayerOptionsDialogWindowComponent, {
        data: {
          playerOptions: { color: null },
          shortenedRoom: this.selectedRoom,
        },
      });
    console.log('this.selectedRoom', this.selectedRoom);
    this.listenForDialogClosing(dialogRef);
  }

  private listenForDialogClosing(
    dialogRef: MatDialogRef<PlayerOptionsDialogWindowComponent, PlayerOptionsData>
  ): void {
    dialogRef
      .afterClosed()
      .pipe(filter(isNotNullish), tap(console.log), takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.playerOptions.emit(result));
  }
}
