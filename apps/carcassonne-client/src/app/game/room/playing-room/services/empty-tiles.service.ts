import { Injectable, signal } from '@angular/core';
import {
  Coordinates,
  CurrentTile,
  Environment,
  ExtendedTile,
  Position,
  TileValues,
} from '@carcasonne-mr/shared-interfaces';
import { TileEnvironments } from '@carcassonne-client/src/app/game/models/Tile';
import { Emptytile } from '@carcassonne-client/src/app/game/models/emptytile';
import { getUUID, serializeObj, TileValuesAfterRotation } from '@shared-functions';
import { BoardService } from './board.service';

@Injectable({
  providedIn: 'root',
})
export class EmptyTilesService {
  private _currentTileEnvironments = signal<TileEnvironments>(this.defaultTileEnvironments);
  public currentTileEnvironments = this._currentTileEnvironments.asReadonly();

  private _emptyTilesMap = new Map<string, Emptytile>();
  private _emptyTiles = signal<Emptytile[]>([]);
  public emptyTiles = this._emptyTiles.asReadonly();

  constructor(private boardService: BoardService) {}

  private get defaultTileEnvironments(): TileEnvironments {
    return {
      top: Environment.FIELD,
      right: Environment.FIELD,
      bottom: Environment.FIELD,
      left: Environment.FIELD,
    };
  }

  public setEmptyTiles(board: ExtendedTile[]): void {
    board.forEach((tile) => {
      this.updateEmptyTileMap(tile.tile.tileValues, tile.rotation, tile.coordinates);
    });
    this.clearRedundantEmptyTiles(board);
    const emptyTiles = Array.from<Emptytile>(this._emptyTilesMap.values());
    this._emptyTiles.set(emptyTiles);
  }

  public setCurrentTileEnvironments(currentTile: CurrentTile | null): void {
    const tileEnvironments: TileEnvironments = this.defaultTileEnvironments;
    const tileValues = currentTile?.tile.tileValues;
    const rotation = currentTile?.rotation;

    if (!tileValues || typeof rotation !== 'number') {
      return this._currentTileEnvironments.set(tileEnvironments);
    }

    return this._currentTileEnvironments.set(
      this.tileValuesToTileEnvironments(tileValues, rotation)
    );
  }

  public updatedEmptyTilesTranslateValue(): void {
    this._emptyTiles.update((_emptyTiles) => {
      return _emptyTiles.map((emptyTile) => {
        return {
          ...emptyTile,
          position: emptyTile.position
            ? {
                ...emptyTile.position,
                top: emptyTile.position.top - this.boardService.boardOffsetYAxisWithMargin,
                left: emptyTile.position.left - this.boardService.boardOffsetXAxisWithMargin,
              }
            : null,
        };
      });
    });
  }

  private tileValuesToTileEnvironments(
    tileValues: TileValues | null,
    tileRotation: number
  ): TileEnvironments {
    const tileEnvironments: TileEnvironments = this.defaultTileEnvironments;

    const tileValuesAfterRotation = TileValuesAfterRotation(tileValues, tileRotation);

    if (!tileValuesAfterRotation) {
      return tileEnvironments;
    }

    for (const [environment, positions] of Object.entries(tileValuesAfterRotation) as [
      Environment,
      [Position[]]
    ][]) {
      positions.flat().forEach((position) => {
        switch (position) {
          case 'TOP':
            tileEnvironments.top = environment;
            break;
          case 'RIGHT':
            tileEnvironments.right = environment;
            break;
          case 'BOTTOM':
            tileEnvironments.bottom = environment;
            break;
          case 'LEFT':
            tileEnvironments.left = environment;
            break;
        }
      });
    }

    return tileEnvironments;
  }

  public checkCurrentTilePlacement(
    clickedEmptyTile: Emptytile,
    tileEnvironments: TileEnvironments = this.currentTileEnvironments()
  ): boolean {
    if (tileEnvironments) {
      let checker = true;

      for (const [key, value] of Object.entries(clickedEmptyTile)) {
        switch (key) {
          case 'bottom':
            checker = value === tileEnvironments.bottom;
            break;
          case 'top':
            checker = value === tileEnvironments.top;
            break;
          case 'right':
            checker = value === tileEnvironments.right;
            break;
          case 'left':
            checker = value === tileEnvironments.left;
            break;
        }
        if (!checker) break;
      }
      return checker;
    } else {
      return false;
    }
  }

  private updateEmptyTileMap(
    tileValues: TileValues | null,
    tileRotation: number,
    coordinates?: { x: number; y: number }
  ): void {
    if (!coordinates) coordinates = { x: 0, y: 0 };

    const tileEnvironments = this.tileValuesToTileEnvironments(tileValues, tileRotation);
    const topCoordinate = { x: coordinates.x, y: coordinates.y + 1 };
    const bottomCoordinate = { x: coordinates.x, y: coordinates.y - 1 };
    const rightCoordinate = { x: coordinates.x + 1, y: coordinates.y };
    const leftCoordinate = { x: coordinates.x - 1, y: coordinates.y };

    this._emptyTilesMap.set(
      JSON.stringify(rightCoordinate),
      this.generateEmptyTile(rightCoordinate, 'left', tileEnvironments.right)
    );
    this._emptyTilesMap.set(
      JSON.stringify(leftCoordinate),
      this.generateEmptyTile(leftCoordinate, 'right', tileEnvironments.left)
    );
    this._emptyTilesMap.set(
      JSON.stringify(topCoordinate),
      this.generateEmptyTile(topCoordinate, 'bottom', tileEnvironments.top)
    );
    this._emptyTilesMap.set(
      JSON.stringify(bottomCoordinate),
      this.generateEmptyTile(bottomCoordinate, 'top', tileEnvironments.bottom)
    );
  }

  private generateEmptyTile(
    coordinates: Coordinates,
    emptyTileKeyPosition: Exclude<keyof Emptytile, 'position'>,
    environment: Environment
  ): Emptytile {
    const value = this._emptyTilesMap.get(JSON.stringify(coordinates));
    const position = this.boardService.makeTranslateString(coordinates);
    const partialEmptyTile: Pick<Emptytile, 'id' | 'bottom' | 'top' | 'right' | 'left'> = {
      [emptyTileKeyPosition]: environment,
      id: getUUID(),
    };

    return value
      ? { ...value, ...partialEmptyTile, position }
      : { position, coordinates, ...partialEmptyTile };
  }

  private clearRedundantEmptyTiles(board: ExtendedTile[]): void {
    board.forEach((tile) => {
      const coordinates = serializeObj(tile.coordinates);
      this._emptyTilesMap.delete(coordinates);
    });
  }
}
