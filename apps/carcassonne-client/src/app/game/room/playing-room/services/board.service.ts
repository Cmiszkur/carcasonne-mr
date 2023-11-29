import { Injectable, signal } from '@angular/core';
import {
  Coordinates,
  CurrentTile,
  ExtendedTile,
  ExtendedTranslatedTile,
  Player,
  Tile,
} from '@carcasonne-mr/shared-interfaces';
import { Pawn } from '@carcassonne-client/src/app/game/models/pawn';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private _currentTile = signal<CurrentTile | null>(null);
  public currentTile = this._currentTile.asReadonly();

  private _firstTilePosition = signal<Coordinates | null>(null);
  public firstTilePosition = this._firstTilePosition.asReadonly();

  private _placedPawn = signal<Pawn | null>(null);
  public placedPawn = this._placedPawn.asReadonly();

  private _tiles = signal<ExtendedTranslatedTile[]>([]);
  public tiles = this._tiles.asReadonly();

  constructor(private roomService: RoomService) {}

  public setCurrentTile(tile: Tile | null): void {
    this._currentTile.set(tile ? this.generateCurrentTile(tile) : null);
  }

  public setFirstTilePosition(coordinates: Coordinates): void {
    this._firstTilePosition.set(coordinates);
  }

  public setPlacedPawn(placedPawn: Pawn | null): void {
    this._placedPawn.set(placedPawn);
  }

  public setTiles(tiles: ExtendedTile[]): void {
    this._tiles.set(this.mapExtendedTiles(tiles));
  }

  public rotateCurrentTile(): void {
    this._currentTile.update((tile) => {
      if (!tile) return null;

      return {
        ...tile,
        rotation: tile.rotation >= 270 ? 0 : tile?.rotation + 90,
      };
    });
  }

  public updateCurrentTileCoordinates(coordinates: Coordinates): void {
    this._currentTile.update((tile) => {
      if (!tile) return null;

      return {
        ...tile,
        coordinates,
        translateValue: this.makeTranslateString(coordinates),
      };
    });
  }

  /**
   * Sends placed tile extended format with placed pawn.
   */
  public sendPlacedTileToServer(tileAndPawnPlacementConfirmed: boolean): void {
    const loggedPlayer: Player | null = this.roomService.playersValue?.loggedPlayer || null;
    const currentTile = this.currentTile();
    const placedPawn = this.placedPawn();

    if (!currentTile || !loggedPlayer) return;

    currentTile.isFollowerPlaced = tileAndPawnPlacementConfirmed && !!placedPawn;
    currentTile.fallowerDetails =
      tileAndPawnPlacementConfirmed && !!placedPawn
        ? {
            placement: placedPawn.placement,
            position: placedPawn.position,
            playerColor: loggedPlayer.color,
            username: loggedPlayer.username,
          }
        : undefined;
    this.roomService.placeTile(currentTile);
  }

  public makeTranslateString(coordinates: Coordinates): string {
    const firstTilePosition = this.firstTilePosition();
    if (firstTilePosition) {
      return `translate(
        ${firstTilePosition.x + 112 * coordinates.x}px,
        ${firstTilePosition.y - 112 * coordinates.y}px)`;
    } else {
      return '';
    }
  }

  private mapExtendedTiles(tiles: ExtendedTile[]): ExtendedTranslatedTile[] {
    return tiles.map((tile) => {
      return {
        ...tile,
        translateValue: this.makeTranslateString(tile.coordinates),
      };
    });
  }

  /**
   * Generates current tile with defaults values.
   * @param tile
   * @private
   */
  private generateCurrentTile(tile: Tile): CurrentTile {
    return {
      tile: tile,
      isFollowerPlaced: false,
      rotation: 0,
      tileValuesAfterRotation: tile.tileValues,
      coordinates: null,
      translateValue: '',
    };
  }
}
