import { Injectable } from '@nestjs/common';
import { Tiles } from '@nest-backend/src/events/schemas/tiles.schema';
import { EmptyTile, TilesSet } from '@carcasonne-mr/shared-interfaces';
import { copy, shuffleArray } from '@shared-functions';
import { EmptyTilesService } from '@nest-backend/src/events/services/empty-tiles.service';

export type DrawTileData = TilesSet & { drawnTileId: string; deletedTile: Tiles | null };

@Injectable()
export class DrawTileService {
  constructor(private emptyTileService: EmptyTilesService) {}

  public drawTileAndUpdateLeftTiles(emptyTiles: EmptyTile[], tiles: Tiles[]): TilesSet {
    const tileSet = this.drawTile(tiles);

    return this.validateAndRedrawTile(
      emptyTiles,
      tileSet,
      tileSet.deletedTile ? [tileSet.deletedTile] : [],
      [tileSet.drawnTileId]
    );
  }

  private validateAndRedrawTile(
    emptyTiles: EmptyTile[],
    tileSet: DrawTileData,
    deletedTiles: Tiles[] = [],
    prevDrawnTileIds: string[] = []
  ): TilesSet {
    if (this.emptyTileService.checkIfTileIsPlayable(tileSet.drawnTile, emptyTiles)) {
      return {
        allTiles: [
          ...tileSet.allTiles,
          ...deletedTiles.filter(
            (tile) => tile.id !== prevDrawnTileIds[prevDrawnTileIds.length - 1]
          ),
        ],
        drawnTile: tileSet.drawnTile,
      };
    }
    if (tileSet.allTiles.length === 0) {
      return { allTiles: [], drawnTile: null };
    }

    const allTiles = this.updateNumberOfTiles(tileSet.allTiles, tileSet.drawnTileId);
    const redrawTileSet = this.redrawTile(allTiles, [...prevDrawnTileIds, tileSet.drawnTileId]);
    return this.validateAndRedrawTile(
      emptyTiles,
      redrawTileSet,
      redrawTileSet.deletedTile ? [...deletedTiles, redrawTileSet.deletedTile] : deletedTiles,
      [...prevDrawnTileIds, redrawTileSet.drawnTileId]
    );
  }

  private redrawTile(tiles: Tiles[], prevDrawnTileIds: string[]): DrawTileData {
    const filteredTiles = tiles.filter(
      (tile: Tiles) => !prevDrawnTileIds.some((prevDrawnTileId) => tile.id === prevDrawnTileId)
    );
    return this.drawTile(filteredTiles);
  }

  private drawTile(providedTilesLeft: Tiles[] | null): DrawTileData {
    let tilesLeft: Tiles[] = copy(providedTilesLeft);
    const pickedTileId: string = this.pickRandomTileId(tilesLeft);
    const drawnTile = tilesLeft.find((tiles) => tiles.id === pickedTileId)?.tile || null;
    const { tilesLeftAfterDel, deletedTile } = this.deletePickedTile(tilesLeft, pickedTileId);
    return { allTiles: tilesLeftAfterDel, drawnTile, drawnTileId: pickedTileId, deletedTile };
  }

  private pickRandomTileId(tilesLeft: Tiles[]): string {
    const tilesDispersed: string[] = tilesLeft.flatMap((tiles) => {
      return Array(tiles.numberOfTiles).fill(tiles.id, 0, tiles.numberOfTiles) as string[];
    });
    const randomNumber: number = Math.floor(Math.random() * tilesLeft.length);
    return shuffleArray(tilesDispersed)[randomNumber];
  }

  private deletePickedTile(
    tilesLeft: Tiles[],
    tilesId: string
  ): { tilesLeftAfterDel: Tiles[]; deletedTile: Tiles | null } {
    const tilesLeftCopied = copy(tilesLeft);
    const indexOfElementToDelete: number = tilesLeftCopied.findIndex(
      (tiles) => tiles.id === tilesId
    );
    let deletedTile: Tiles | null = null;
    tilesLeftCopied[indexOfElementToDelete].numberOfTiles -= 1;
    if (tilesLeftCopied[indexOfElementToDelete].numberOfTiles === 0) {
      deletedTile = tilesLeftCopied.splice(indexOfElementToDelete, 1)[0];
    }
    return {
      tilesLeftAfterDel: tilesLeftCopied,
      deletedTile: deletedTile
        ? { ...deletedTile, numberOfTiles: deletedTile.numberOfTiles + 1 }
        : null,
    };
  }

  private updateNumberOfTiles(tiles: Tiles[], drawnTileId: string): Tiles[] {
    const index = tiles.findIndex((tile) => tile.id === drawnTileId);
    if (index !== -1) {
      const updatedObject: Tiles = {
        ...tiles[index],
        numberOfTiles: tiles[index].numberOfTiles + 1,
      };
      return [...tiles.slice(0, index), updatedObject, ...tiles.slice(index + 1)];
    }
    return tiles; // If the object is not found, return the original array
  }
}
