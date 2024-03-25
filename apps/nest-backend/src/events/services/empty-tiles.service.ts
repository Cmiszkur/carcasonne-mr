import { Injectable } from '@nestjs/common';
import {
  Coordinates,
  EmptyTile,
  Environment,
  ExtendedTile,
  Tile,
  TileEnvironments,
} from '@carcasonne-mr/shared-interfaces';
import {
  checkTilePlacement,
  getUUID,
  serializeObj,
  tileValuesToTileEnvironments,
} from '@shared-functions';

@Injectable()
export class EmptyTilesService {
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
    const tileEnvironments = tileValuesToTileEnvironments(tileValues, tileRotation);
    const topCoordinate = { x: coordinates.x, y: coordinates.y + 1 };
    const bottomCoordinate = { x: coordinates.x, y: coordinates.y - 1 };
    const rightCoordinate = { x: coordinates.x + 1, y: coordinates.y };
    const leftCoordinate = { x: coordinates.x - 1, y: coordinates.y };

    emptyTilesMap.set(
      JSON.stringify(rightCoordinate),
      this.generateEmptyTile(
        rightCoordinate,
        'left',
        tileEnvironments.right,
        emptyTilesMap.get(serializeObj(rightCoordinate))
      )
    );
    emptyTilesMap.set(
      JSON.stringify(leftCoordinate),
      this.generateEmptyTile(
        leftCoordinate,
        'right',
        tileEnvironments.left,
        emptyTilesMap.get(serializeObj(leftCoordinate))
      )
    );
    emptyTilesMap.set(
      JSON.stringify(topCoordinate),
      this.generateEmptyTile(
        topCoordinate,
        'bottom',
        tileEnvironments.top,
        emptyTilesMap.get(serializeObj(topCoordinate))
      )
    );
    emptyTilesMap.set(
      JSON.stringify(bottomCoordinate),
      this.generateEmptyTile(
        bottomCoordinate,
        'top',
        tileEnvironments.bottom,
        emptyTilesMap.get(serializeObj(bottomCoordinate))
      )
    );

    board.forEach((tile) => {
      const coordinates = serializeObj(tile.coordinates);
      emptyTilesMap.delete(coordinates);
    });

    return Array.from<EmptyTile>(emptyTilesMap.values());
  }

  public checkIfTileIsPlayable(drawnTile: Tile, emptyTiles: EmptyTile[]): boolean {
    let checker = false;
    let tile: TileEnvironments = tileValuesToTileEnvironments(drawnTile.tileValues, 0);

    for (const emptyTile of emptyTiles) {
      let rotateCounter = 0;
      if (checker) {
        break;
      } else {
        while (rotateCounter < 3 && !checker) {
          checker = checkTilePlacement(emptyTile, tile);
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
}
