import { Injectable } from '@nestjs/common';
import { Coordinates, Position, ExtendedTile } from '@carcasonne-mr/shared-interfaces';

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

  public getCorrespondingCoordinates(
    position: Position,
    coordinates: Coordinates
  ): Coordinates | null {
    switch (position) {
      case Position.TOP:
        return this.topCoordinates(coordinates);
      case Position.RIGHT:
        return this.rightCoordinates(coordinates);
      case Position.BOTTOM:
        return this.bottomCoordinates(coordinates);
      case Position.LEFT:
        return this.leftCoordinates(coordinates);
      default:
        return null;
    }
  }

  public checkCoordinates(coordinatesA: Coordinates, coordinatesB: Coordinates): boolean {
    return coordinatesA.x === coordinatesB.x && coordinatesA.y === coordinatesB.y;
  }

  public checkForChurchesAround(board: ExtendedTile[], placedTile: ExtendedTile): ExtendedTile[] {
    return this.extractSurroundingTiles(board, placedTile).filter((tile) => tile.tile.hasChurch);
  }

  public numberOfTilesAround(board: ExtendedTile[], placedTile: ExtendedTile): number {
    return this.extractSurroundingTiles(board, placedTile).length;
  }

  private extractSurroundingTiles(board: ExtendedTile[], placedTile: ExtendedTile): ExtendedTile[] {
    const placedCoordinates = placedTile.coordinates;
    const coordinates: Coordinates[] = [
      { x: placedCoordinates.x - 1, y: placedCoordinates.y + 1 },
      this.topCoordinates(placedCoordinates),
      { x: placedCoordinates.x + 1, y: placedCoordinates.y + 1 },
      this.rightCoordinates(placedCoordinates),
      { x: placedCoordinates.x + 1, y: placedCoordinates.y - 1 },
      this.bottomCoordinates(placedCoordinates),
      { x: placedCoordinates.x - 1, y: placedCoordinates.y - 1 },
      this.leftCoordinates(placedCoordinates),
    ];

    return coordinates
      .map((coordinate) => {
        return board.find((tile) => this.checkCoordinates(tile.coordinates, coordinate));
      })
      .filter(Boolean);
  }

  private topCoordinates(coordinates: Coordinates): Coordinates {
    return { x: coordinates.x, y: coordinates.y + 1 };
  }

  private rightCoordinates(coordinates: Coordinates): Coordinates {
    return { x: coordinates.x + 1, y: coordinates.y };
  }

  private bottomCoordinates(coordinates: Coordinates): Coordinates {
    return { x: coordinates.x, y: coordinates.y - 1 };
  }

  private leftCoordinates(coordinates: Coordinates): Coordinates {
    return { x: coordinates.x - 1, y: coordinates.y };
  }
}
