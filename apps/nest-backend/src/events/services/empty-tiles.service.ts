import { Injectable } from '@nestjs/common';
import {
  Coordinates,
  EmptyTile,
  Environment,
  ExtendedTile,
  Position,
  Tile,
  TileValues,
} from '@carcasonne-mr/shared-interfaces';
import { getUUID, serializeObj, TileValuesAfterRotation } from '@shared-functions';
import { TileEnvironments } from '@carcassonne-client/src/app/game/models/Tile';

@Injectable()
export class EmptyTilesService {
  private get defaultTileEnvironments(): TileEnvironments {
    return {
      top: Environment.FIELD,
      right: Environment.FIELD,
      bottom: Environment.FIELD,
      left: Environment.FIELD,
    };
  }

  public updateEmptyTiles(
    placedTile: ExtendedTile,
    board: ExtendedTile[],
    emptyTiles: EmptyTile[]
  ): EmptyTile[] {
    const coordinates = placedTile.coordinates;
    const tileValues = placedTile.tile.tileValues;
    const tileRotation = placedTile.rotation;
    const emptyTilesMap = new Map<string, EmptyTile>(
      emptyTiles.map((emptyTile) => [serializeObj(emptyTile.coordinates), emptyTile])
    );
    const tileEnvironments = this.tileValuesToTileEnvironments(tileValues, tileRotation);
    const topCoordinate = { x: coordinates.x, y: coordinates.y + 1 };
    const bottomCoordinate = { x: coordinates.x, y: coordinates.y - 1 };
    const rightCoordinate = { x: coordinates.x + 1, y: coordinates.y };
    const leftCoordinate = { x: coordinates.x - 1, y: coordinates.y };

    emptyTilesMap.set(
      JSON.stringify(rightCoordinate),
      this.generateEmptyTile(rightCoordinate, 'left', tileEnvironments.right)
    );
    emptyTilesMap.set(
      JSON.stringify(leftCoordinate),
      this.generateEmptyTile(leftCoordinate, 'right', tileEnvironments.left)
    );
    emptyTilesMap.set(
      JSON.stringify(topCoordinate),
      this.generateEmptyTile(topCoordinate, 'bottom', tileEnvironments.top)
    );
    emptyTilesMap.set(
      JSON.stringify(bottomCoordinate),
      this.generateEmptyTile(bottomCoordinate, 'top', tileEnvironments.bottom)
    );

    board.forEach((tile) => {
      const coordinates = serializeObj(tile.coordinates);
      emptyTilesMap.delete(coordinates);
    });

    return Array.from<EmptyTile>(emptyTilesMap.values());
  }

  public checkIfTileIsPlayable(drawnTile: Tile, emptyTiles: EmptyTile[]): boolean {
    let checker = false;
    let tile: TileEnvironments = this.tileValuesToTileEnvironments(drawnTile.tileValues, 0);

    for (const emptyTile of emptyTiles) {
      let rotateCounter = 0;
      if (checker) {
        break;
      } else {
        while (rotateCounter < 3 && !checker) {
          checker = this.checkTilePlacement(emptyTile, tile);
          tile = this.rotate90Degree(tile);
          rotateCounter++;
        }
      }
    }

    return checker;
  }

  private rotate90Degree(emptyTile: TileEnvironments): TileEnvironments {
    return {
      top: emptyTile.left,
      right: emptyTile.top,
      bottom: emptyTile.right,
      left: emptyTile.bottom,
    };
  }

  private generateEmptyTile(
    coordinates: Coordinates,
    emptyTileKeyPosition: Exclude<keyof EmptyTile, 'position'>,
    environment: Environment,
    emptyTile?: EmptyTile
  ): EmptyTile {
    const partialEmptyTile: Pick<EmptyTile, 'id' | 'bottom' | 'top' | 'right' | 'left'> = {
      [emptyTileKeyPosition]: environment,
      id: getUUID(),
    };

    // @ts-ignore
    return emptyTile ? { ...emptyTile, ...partialEmptyTile } : { coordinates, ...partialEmptyTile };
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

  private checkTilePlacement(
    clickedEmptyTile: EmptyTile,
    tileEnvironments: TileEnvironments
  ): boolean {
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
  }
}
