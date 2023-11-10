import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayersColors, ShortenedRoom } from 'src/app/game/models/Room';
import { PlayerOptionsData } from '../../../models/dialogWindowData';

@Component({
  selector: 'app-player-options-dialog-window',
  templateUrl: './player-options-dialog-window.component.html',
  styleUrls: ['./player-options-dialog-window.component.sass'],
})
export class PlayerOptionsDialogWindowComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<PlayerOptionsDialogWindowComponent, PlayerOptionsData>,
    @Inject(MAT_DIALOG_DATA) public data: PlayerOptionsData
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  public get colors(): string[] {
    return Object.values(PlayersColors);
  }

  /**
   * Returns colors available to player. If player is creating the room it returns all four colors
   * otherwise it filters out color already picked by other players.
   */
  public get availableColors(): string[] {
    const shortenedRoom: ShortenedRoom | null = this.data.shortenedRoom;
    if (shortenedRoom === null) return this.colors;
    const takenColors: string[] = shortenedRoom.players.map(player => player.color);
    return this.colors.filter(color => takenColors.indexOf(color) === -1);
  }
}
