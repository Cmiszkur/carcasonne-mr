import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoutingModule } from './game-routing.module';
import { StartingRoomComponent } from './starting-room/starting-room.component';
import { FetchedRoomsResultTableComponent } from './starting-room/fetched-rooms-result-table/fetched-rooms-result-table.component';
import { PlayerTableCellComponent } from './starting-room/fetched-rooms-result-table/player-table-cell/player-table-cell.component';
import { PlayerOptionsDialogButtonComponent } from './starting-room/player-options-dialog-button/player-options-dialog-button.component';
import { PlayerOptionsDialogWindowComponent } from './starting-room/player-options-dialog-button/player-options-dialog-window/player-options-dialog-window.component';
import { CommonsModule } from '../commons/commons.module';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './game.component';

@NgModule({
  declarations: [
    StartingRoomComponent,
    FetchedRoomsResultTableComponent,
    PlayerTableCellComponent,
    PlayerOptionsDialogButtonComponent,
    PlayerOptionsDialogWindowComponent,
    GameComponent,
  ],
  imports: [CommonModule, GameRoutingModule, CommonsModule, FormsModule],
})
export class GameModule {}
