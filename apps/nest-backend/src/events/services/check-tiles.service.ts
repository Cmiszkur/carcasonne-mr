import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Coordinates,
  Environment,
  ExtendedTile,
  Position,
  TileValues,
  TileValuesFlat,
} from '@carcasonne-mr/shared-interfaces';
import { Room, RoomDocument } from '../schemas/room.schema';
import { TilesService } from './tiles.service';

@Injectable()
export class CheckTilesService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private tilesService: TilesService
  ) {}

  public async checkTile(
    roomID: string,
    extendedTile: ExtendedTile,
    uncheckedTiles?: ExtendedTile[]
  ): Promise<boolean> {
    const _uncheckedTiles: ExtendedTile[] =
      uncheckedTiles || (await this.roomModel.findOne({ roomId: roomID }).lean())?.board || [];
    const tileCoordinates = extendedTile.coordinates;

    if (this.coordinatesAlreadyTaken(_uncheckedTiles, tileCoordinates)) {
      return false;
    }

    const tilesWithCoordinatesToCheck: Map<Position, ExtendedTile> | null =
      this.setTilesWithCoordinatesToCheck(_uncheckedTiles, tileCoordinates);
    return this.compareTileValues(
      extendedTile.tileValuesAfterRotation,
      tilesWithCoordinatesToCheck
    );
  }

  /**
   * Sets tiles with coordinates that coresponds with left, right, top, bottom side of placed tile coordinates
   * inside the map object and sets adequate position key.
   * TODO: Usunąć `indexToPositionValue`.
   * @param uncheckedTiles - All tiles collected from the board.
   * @param coordinates - The coordinates of the placed tile.
   * @returns
   */
  private setTilesWithCoordinatesToCheck(
    uncheckedTiles: ExtendedTile[],
    coordinates: Coordinates
  ): Map<Position, ExtendedTile> {
    const tilesWithCoordinatesToCheck = new Map<Position, ExtendedTile>();
    const coordinatesToCheck: Coordinates[] = [
      { x: coordinates.x - 1, y: coordinates.y },
      { x: coordinates.x + 1, y: coordinates.y },
      { x: coordinates.x, y: coordinates.y - 1 },
      { x: coordinates.x, y: coordinates.y + 1 },
    ];
    const indexToPositionValue = new Map<number, Position>([
      [1, Position.LEFT],
      [2, Position.RIGHT],
      [3, Position.BOTTOM],
      [4, Position.TOP],
    ]);

    coordinatesToCheck.forEach((coordinates, coordinatesIndex) => {
      uncheckedTiles.every((tileToCheck) => {
        const matchingCoordinates = this.tilesService.checkCoordinates(
          tileToCheck.coordinates,
          coordinates
        );

        if (!matchingCoordinates) {
          return true;
        }
        const checkedTilePosition = indexToPositionValue.get(coordinatesIndex + 1);
        tilesWithCoordinatesToCheck.set(checkedTilePosition, tileToCheck);
        return false;
      });
    });
    return tilesWithCoordinatesToCheck;
  }

  private compareTileValues(
    tileValues: TileValues | null,
    tilesWithCoordinatesToCheck: Map<Position, ExtendedTile>
  ): boolean {
    let isOK = false;

    //Iterates through tiles that are nearby placed tile.
    for (const [position, tileWithCoordinatesToCheck] of tilesWithCoordinatesToCheck) {
      const oppositePosition: Position | undefined =
        this.tilesService.getOppositePositions(position);
      const currentlyCheckedTileValues: TileValues | null =
        tileWithCoordinatesToCheck.tileValuesAfterRotation;

      if (oppositePosition) {
        const checkedTileEnvironment = this.getEnvironmentFromPostition(
          currentlyCheckedTileValues,
          oppositePosition
        );
        const placedTileEnvironment = this.getEnvironmentFromPostition(tileValues, position);
        isOK = placedTileEnvironment === checkedTileEnvironment;
      }
    }

    return isOK;
  }

  private getEnvironmentFromPostition(
    tileValues: TileValues | null,
    position: Position
  ): keyof TileValuesFlat | null {
    const placedTileValuesFlat: TileValuesFlat | null = this.flatTileValues(tileValues);

    if (!placedTileValuesFlat) {
      return null;
    }

    const hasCitiesInPosition = placedTileValuesFlat.cities.some(
      (positionInCities) => position === positionInCities
    );
    const hasRoadsInPosition = placedTileValuesFlat.roads.some(
      (positionInRoads) => position === positionInRoads
    );

    if (hasCitiesInPosition) {
      return Environment.CITIES;
    }
    return hasRoadsInPosition ? Environment.ROADS : null;
  }

  private flatTileValues(tileValues: TileValues | null): TileValuesFlat | null {
    return tileValues
      ? {
          cities: tileValues.cities?.flat() || [],
          roads: tileValues.roads?.flat() || [],
        }
      : null;
  }

  private coordinatesAlreadyTaken(tiles: ExtendedTile[], coordinates: Coordinates): boolean {
    return (
      tiles.findIndex((tile) =>
        this.tilesService.checkCoordinates(tile.coordinates, coordinates)
      ) >= 0
    );
  }
}
