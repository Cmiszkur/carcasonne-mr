import { Injectable } from '@nestjs/common';
import { Coordinates, Position, ExtendedTile } from '@carcasonne-mr/shared-interfaces';
import {
  bottomCoordinates,
  checkCoordinates,
  leftCoordinates,
  rightCoordinates,
  topCoordinates,
} from '@shared-functions';

@Injectable()
export class TilesService {
  private oppositePositions: Map<Position, Position>;

  constructor() {
    this.oppositePositions = new Map<Position, Position>([
      [Position.TOP, Position.BOTTOM],
      [Position.BOTTOM, Position.TOP],
      [Position.LEFT, Position.RIGHT],
      [Position.RIGHT, Position.LEFT],
    ]);
  }

  public getOppositePositions(position: Position): Position | undefined {
    return this.oppositePositions.get(position);
  }

  public checkCoordinates(coordinatesA: Coordinates, coordinatesB: Coordinates): boolean {
    return coordinatesA.x === coordinatesB.x && coordinatesA.y === coordinatesB.y;
  }

  public checkForChurchesAround(board: ExtendedTile[], placedTile: ExtendedTile): ExtendedTile[] {
    return this.extractSurroundingTiles(board, placedTile).filter((tile) => tile.tile.hasChurch);
  }

  public getAllTilesWithUncompletedChurches(board: ExtendedTile[]): ExtendedTile[] {
    return board.filter((exTile) => exTile.tile.hasChurch && !!exTile.fallowerDetails);
  }

  public numberOfTilesAround(board: ExtendedTile[], placedTile: ExtendedTile): number {
    return this.extractSurroundingTiles(board, placedTile).length;
  }

  private extractSurroundingTiles(board: ExtendedTile[], placedTile: ExtendedTile): ExtendedTile[] {
    const placedCoordinates = placedTile.coordinates;
    const coordinates: Coordinates[] = [
      { x: placedCoordinates.x - 1, y: placedCoordinates.y + 1 },
      topCoordinates(placedCoordinates),
      { x: placedCoordinates.x + 1, y: placedCoordinates.y + 1 },
      rightCoordinates(placedCoordinates),
      { x: placedCoordinates.x + 1, y: placedCoordinates.y - 1 },
      bottomCoordinates(placedCoordinates),
      { x: placedCoordinates.x - 1, y: placedCoordinates.y - 1 },
      leftCoordinates(placedCoordinates),
    ];

    return coordinates
      .map((coordinate) => {
        return board.find((tile) => checkCoordinates(tile.coordinates, coordinate));
      })
      .filter(Boolean);
  }
}
