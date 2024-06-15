import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomRoutingModule } from './room-routing.module';
import { RoomComponent } from './room.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlayingRoomComponent } from './playing-room/playing-room.component';
import { EmptyTileClickDirective } from './playing-room/directives/empty-tile-click.directive';
import { CommonsModule } from '../../commons/commons.module';
import { WaitingRoomComponent } from './waiting-room/waiting-room.component';
import { PlayerSectionComponent } from './dashboard/player-section/player-section.component';
import { TileComponent } from './playing-room/tile/tile.component';
import { EmptyTileComponent } from './playing-room/empty-tile/empty-tile.component';
import { PawnComponent } from './playing-room/tile/pawn/pawn.component';
import { TileAndPawnConfirmationButtonComponent } from './playing-room/no-pawn-confirmation/tile-and-pawn-confirmation-button';
import { NoPawnConfirmationDialogWindowComponent } from './playing-room/no-pawn-confirmation/no-pawn-confirmation-dialog-window/no-pawn-confirmation-dialog-window.component';
import { MovesChatComponent } from './moves-chat/moves-chat.component';

@NgModule({
  declarations: [
    RoomComponent,
    DashboardComponent,
    PlayingRoomComponent,
    TileComponent,
    EmptyTileComponent,
    EmptyTileClickDirective,
    WaitingRoomComponent,
    PlayerSectionComponent,
    PawnComponent,
    TileAndPawnConfirmationButtonComponent,
    NoPawnConfirmationDialogWindowComponent,
    MovesChatComponent,
  ],
  imports: [CommonModule, RoomRoutingModule, CommonsModule],
})
export class RoomModule {}
