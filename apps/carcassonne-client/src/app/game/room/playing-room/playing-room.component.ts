import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { AuthService } from '../../../user/auth.service';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@carcassonne-client/src/app/commons/components/base/base.component';
import {
  CurrentTile,
  ExtendedTile,
  RoomAbstract,
  Tile,
} from '@carcasonne-mr/shared-interfaces';
import { SocketService } from '@carcassonne-client/src/app/commons/services/socket.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './playing-room.component.html',
  styleUrls: ['./playing-room.component.sass'],
})
export class PlayingRoomComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  public username: string | null;
  public tiles: ExtendedTile[] | null;
  public currentTile: CurrentTile | null;
  private newRoom: RoomAbstract | null;

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private socketService: SocketService
  ) {
    super();
    this.newRoom = this.roomService.currentRoomValue;
    this.currentTile = this.setCurrentTile(this.newRoom?.lastChosenTile?.tile);
    this.username = this.authService.user?.username || null;
    this.tiles = this.newRoom?.board || null;
  }

  ngOnInit(): void {
    this.listenForNewTiles();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.socketService.removeListener('tile_placed_new_tile_distributed');
  }

  /**
   * Generates current tile with defaults values.
   * @param tile
   * @private
   */
  private static generateCurrentTile(tile: Tile): CurrentTile {
    return {
      tile: tile,
      isFollowerPlaced: false,
      rotation: 0,
      tileValuesAfterRotation: tile.tileValues,
      coordinates: null,
    };
  }

  /**
   * Sets current tile.
   * @param tile
   * @private
   */
  private setCurrentTile(
    tile: Tile | null | undefined,
    activePlayer?: string
  ): CurrentTile | null {
    console.log(this.username, this.newRoom?.lastChosenTile?.player);
    const isUsersTurn: boolean = this.username === activePlayer;
    return tile && isUsersTurn
      ? PlayingRoomComponent.generateCurrentTile(tile)
      : null;
  }

  /**
   * Listens for changes in the current room. Updating tiles and current tile.
   */
  private listenForNewTiles(): void {
    this.roomService
      .receiveTilePlacedResponse()
      .pipe(takeUntil(this.destroyed))
      .subscribe((answer) => {
        const room = answer.answer?.room;
        this.tiles = room?.board || null;
        this.currentTile = this.setCurrentTile(
          room?.lastChosenTile?.tile,
          room?.lastChosenTile?.player
        );
      });
  }
}
