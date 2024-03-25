import { Injectable, signal } from '@angular/core';
import {
  CurrentTile,
  EmptyTile,
  ExtendedEmptyTile,
  TileEnvironments,
} from '@carcasonne-mr/shared-interfaces';
import { defaultTileEnvironments, tileValuesToTileEnvironments } from '@shared-functions';
import { BoardService } from './board.service';

@Injectable({
  providedIn: 'root',
})
export class EmptyTilesService {
  private _currentTileEnvironments = signal<TileEnvironments>(this.defaultTileEnvironments);
  public currentTileEnvironments = this._currentTileEnvironments.asReadonly();

  private _emptyTiles = signal<ExtendedEmptyTile[]>([]);
  public emptyTiles = this._emptyTiles.asReadonly();

  constructor(private boardService: BoardService) {}

  private get defaultTileEnvironments(): TileEnvironments {
    return defaultTileEnvironments();
  }

  public setEmptyTiles(emptyTiles: EmptyTile[]): void {
    this._emptyTiles.set(this.mapExtendedEmptyTile(emptyTiles));
  }

  public setCurrentTileEnvironments(currentTile: CurrentTile | null): void {
    const tileEnvironments: TileEnvironments = this.defaultTileEnvironments;
    const tileValues = currentTile?.tile.tileValues;
    const rotation = currentTile?.rotation;

    if (!tileValues || typeof rotation !== 'number') {
      return this._currentTileEnvironments.set(tileEnvironments);
    }

    return this._currentTileEnvironments.set(tileValuesToTileEnvironments(tileValues, rotation));
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

  private mapExtendedEmptyTile(emptyTiles: EmptyTile[]): ExtendedEmptyTile[] {
    return emptyTiles.map((emptyTile) => {
      return {
        ...emptyTile,
        position: this.boardService.makeTranslateString(emptyTile.coordinates),
      };
    });
  }
}
