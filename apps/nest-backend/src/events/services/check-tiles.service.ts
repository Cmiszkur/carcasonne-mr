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
import { copy } from '../functions/copyObject';

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
      uncheckedTiles ||
      (await this.roomModel.findOne({ roomId: roomID }).lean())?.board ||
      [];
    const tileCoordinates = extendedTile.coordinates;

    if (this.coordinatesAlreadyTaken(_uncheckedTiles, tileCoordinates)) {
      return false;
    }

    const tilesWithCoordinatesToCheck: Map<Position, ExtendedTile> | null =
      this.setTilesWithCoordinatesToCheck(_uncheckedTiles, tileCoordinates);
    const tileValuesAfterRotation = this.tilesValuesAfterRotation(
      extendedTile.tile.tileValues,
      extendedTile.rotation
    );
    return this.compareTileValues(
      tileValuesAfterRotation,
      tilesWithCoordinatesToCheck
    );
  }

  /**
   * Returns tile values after rotation.
   * @param tileValues
   * @param rotation
   * @returns
   */
  public tilesValuesAfterRotation(
    tileValues: TileValues | null,
    rotation: number
  ): TileValues | null {
    if (tileValues === null) {
      return null;
    }
    const copiedTileValues: TileValues = copy(tileValues);
    const positions: Position[] = [
      Position.TOP,
      Position.RIGHT,
      Position.BOTTOM,
      Position.LEFT,
    ];
    const rotationValueToIndexSkip = new Map<number, number>([
      [0, 0],
      [90, 1],
      [180, 2],
      [270, 3],
    ]);
    const indexesToSkip: number | undefined =
      rotationValueToIndexSkip.get(rotation);

    for (const [key, positionsInTileValues] of Object.entries(
      copiedTileValues
    )) {
      (positionsInTileValues as [Position[]]).forEach(
        (positionSet: Position[]) => {
          positionSet.forEach((position: Position, positionIndex: number) => {
            const indexInPositionsTable: number = positions.indexOf(position);
            if (indexesToSkip && indexInPositionsTable >= 0) {
              positionSet[positionIndex] =
                positions[(indexInPositionsTable + indexesToSkip) % 4];
            }
          });
        }
      );
    }
    return copiedTileValues;
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
        const checkedTilePosition = indexToPositionValue.get(
          coordinatesIndex + 1
        );
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
    for (const [
      position,
      tileWithCoordinatesToCheck,
    ] of tilesWithCoordinatesToCheck) {
      const oppositePosition: Position | undefined =
        this.tilesService.getOppositePositions(position);
      const currentlyCheckedTileValues: TileValues | null =
        tileWithCoordinatesToCheck.tileValuesAfterRotation;

      if (oppositePosition) {
        const checkedTileEnvironment = this.getEnvironmentFromPostition(
          currentlyCheckedTileValues,
          oppositePosition
        );
        const placedTileEnvironment = this.getEnvironmentFromPostition(
          tileValues,
          position
        );
        isOK = placedTileEnvironment === checkedTileEnvironment;
      }
    }

    return isOK;
  }

  private getEnvironmentFromPostition(
    tileValues: TileValues | null,
    position: Position
  ): keyof TileValuesFlat | null {
    const placedTileValuesFlat: TileValuesFlat | null =
      this.flatTileValues(tileValues);

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

  private coordinatesAlreadyTaken(
    tiles: ExtendedTile[],
    coordinates: Coordinates
  ): boolean {
    return (
      tiles.findIndex((tile) =>
        this.tilesService.checkCoordinates(tile.coordinates, coordinates)
      ) >= 0
    );
  }
}
