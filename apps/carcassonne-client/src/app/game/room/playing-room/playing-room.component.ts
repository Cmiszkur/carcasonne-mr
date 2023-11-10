import { ExtendedTile } from 'src/app/game/models/Room';
import { Component, OnInit } from '@angular/core';
import { Room } from '../../models/Room';
import { RoomService } from '../../services/room.service';
import { AuthService } from '../../../user/auth.service';
import { Tile } from '../../models/Tile';
import { BaseComponent } from 'src/app/commons/components/base/base.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './playing-room.component.html',
  styleUrls: ['./playing-room.component.sass'],
})
export class PlayingRoomComponent extends BaseComponent implements OnInit {
  public username: string | null;
  public tiles: ExtendedTile[] | null;
  public currentTile: ExtendedTile | null;
  private newRoom: Room | null;

  constructor(private roomService: RoomService, private authService: AuthService) {
    super();
    this.newRoom = this.roomService.currentRoomValue;
    this.currentTile = this.setCurrentTile(this.newRoom?.lastChosenTile.tile);
    this.username = this.authService.user?.username || null;
    this.tiles = this.newRoom?.board || null;
  }

  ngOnInit(): void {
    this.listenForNewTiles();
  }

  /**
   * Generates current tile with defaults values.
   * @param tile
   * @private
   */
  private static generateCurrentTile(tile: Tile): ExtendedTile {
    return {
      tile: tile,
      isFollowerPlaced: false,
      rotation: 0,
      tileValuesAfterRotation: tile.tileValues,
    };
  }

  /**
   * Sets current tile.
   * @param tile
   * @private
   */
  private setCurrentTile(tile: Tile | null | undefined, activePlayer?: string): ExtendedTile | null {
    console.log(this.username, this.newRoom?.lastChosenTile.player);
    const isUsersTurn: boolean = this.username === activePlayer;
    return tile && isUsersTurn ? PlayingRoomComponent.generateCurrentTile(tile) : null;
  }

  /**
   * Listens for changes in the current room. Updating tiles and current tile.
   */
  private listenForNewTiles(): void {
    this.roomService.currentRoom.pipe(takeUntil(this.destroyed)).subscribe(room => {
      this.tiles = room?.board || null;
      this.currentTile = this.setCurrentTile(room?.lastChosenTile.tile, room?.lastChosenTile.player);
    });
  }
}
