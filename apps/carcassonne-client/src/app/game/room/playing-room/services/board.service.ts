import { TileService } from './../tile/services/tile.service';
import { Injectable, signal } from '@angular/core';
import {
  Coordinates,
  CurrentTile,
  ExtendedTile,
  ExtendedTranslatedTile,
  Player,
  Tile,
} from '@carcasonne-mr/shared-interfaces';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private _currentTile = signal<CurrentTile | null>(null);
  public currentTile = this._currentTile.asReadonly();

  private _firstTilePosition = signal<Coordinates | null>(null);
  public firstTilePosition = this._firstTilePosition.asReadonly();

  private _tiles = signal<ExtendedTranslatedTile[]>([]);
  public tiles = this._tiles.asReadonly();

  private _boardOffsetYAxis = signal<number | null>(null);
  public boardOffsetYAxis = this._boardOffsetYAxis.asReadonly();

  public boardOffsetYAxisWithMargin = 0;

  constructor(private roomService: RoomService, private tileService: TileService) {}

  private getHighestYAxis(tiles: ExtendedTranslatedTile[] | ExtendedTile[]): number | null {
    return tiles.length > 0
      ? tiles
          .map((tile) => tile.coordinates.y)
          .reduce((prevValue, currValue) => (prevValue < currValue ? currValue : prevValue))
      : null;
  }

  public setBoardOffsetYAxis(
    tiles: ExtendedTranslatedTile[] | ExtendedTile[] = this.tiles()
  ): number | null {
    const firstTilePosition = this.firstTilePosition();
    const highestYAxis = this.getHighestYAxis(tiles);
    this._boardOffsetYAxis.set(
      firstTilePosition && highestYAxis
        ? firstTilePosition.y - (highestYAxis + 1) * 100 - (highestYAxis + 1) * 12 + 6
        : null
    );
    return this.boardOffsetYAxis();
  }

  public setCurrentTile(tile: Tile | null): void {
    this._currentTile.set(tile ? this.generateCurrentTile(tile) : null);
  }

  public setFirstTilePosition(coordinates: Coordinates): void {
    this._firstTilePosition.set(coordinates);
  }

  public setTiles(tiles: ExtendedTile[]): void {
    this._tiles.set(this.mapExtendedTiles(tiles));
  }

  public updatedTilesTranslateValue(): void {
    this._tiles.update((tiles) => {
      return tiles.map((tile) => {
        return {
          ...tile,
          translateValue: tile.translateValue
            ? {
                ...tile.translateValue,
                top: tile.translateValue.top - this.boardOffsetYAxisWithMargin,
              }
            : null,
        };
      });
    });
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
    const placedPawn = this.tileService.placedPawn();

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

  public makeTranslateString(coordinates: Coordinates): { left: number; top: number } | null {
    const firstTilePosition = this.firstTilePosition();
    if (firstTilePosition) {
      return {
        left: firstTilePosition.x + 112 * coordinates.x,
        top: firstTilePosition.y - 112 * coordinates.y - this.boardOffsetYAxisWithMargin,
      };
    } else {
      return null;
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
      translateValue: null,
    };
  }
}
