import { Injectable, signal } from '@angular/core';
import {
  Coordinates,
  CurrentTile,
  Environment,
  ExtendedTile,
  Paths,
  Position,
  TranslateValue,
} from '@carcasonne-mr/shared-interfaces';
import { Pawn } from '@carcassonne-client/src/app/game/models/pawn';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';
import {
  TileValuesAfterRotation,
  calculateNearestCoordinates,
  compareArrays,
  searchForPathWithGivenCoordinates,
} from '@shared-functions';

@Injectable({
  providedIn: 'root',
})
export class TileService {
  /**
   * Pawns corresponding to possible positions on the tile.
   */
  private _possiblePawnPlacements = signal<Pawn[]>([]);
  public possiblePawnPlacements = this._possiblePawnPlacements.asReadonly();

  private _placedPawn = signal<Pawn | null>(null);
  public placedPawn = this._placedPawn.asReadonly();

  constructor(private roomService: RoomService) {}

  public clearPlacedTile(): void {
    this.setPlacedPawn(null);
  }

  public fillPossiblePawnPlacements(extendedTile: ExtendedTile | CurrentTile | null): void {
    const possiblePawnPlacements: (Pawn | null)[] = [];

    if (!extendedTile) return;

    if (extendedTile.tile.hasChurch) {
      possiblePawnPlacements.push({
        transformValue: { left: 42, top: 42 },
        placement: Environment.CHURCH,
        position: [],
      });
    }

    const tileValuesAfterRotation = TileValuesAfterRotation(
      extendedTile.tile.tileValues,
      extendedTile.rotation
    );
    const coordinates = extendedTile.coordinates;
    const roads = tileValuesAfterRotation?.roads;
    const cities = tileValuesAfterRotation?.cities;
    const filteredRoads =
      roads && coordinates ? this.filterValues(roads, coordinates, 'roads') : roads;
    const filteredCities =
      cities && coordinates ? this.filterValues(cities, coordinates, 'cities') : cities;

    filteredCities?.forEach((positionCluster) => {
      possiblePawnPlacements.push(this.generatePawn(positionCluster, Environment.CITIES));
    });
    filteredRoads?.forEach((positionCluster) => {
      possiblePawnPlacements.push(this.generatePawn(positionCluster, Environment.ROADS));
    });

    this._possiblePawnPlacements.set(possiblePawnPlacements.filter(Boolean) as Pawn[]);
  }

  public generatePawn(
    values: Position[],
    key: Environment,
    hasChurch: boolean = false
  ): Pawn | null {
    if (!values.length && !hasChurch) {
      return null;
    }

    if (values.length >= 2 || hasChurch) {
      return {
        transformValue: this.pawnTranslateValuePositionCluster(values, key),
        placement: hasChurch ? Environment.CHURCH : key,
        position: hasChurch ? [] : values,
      };
    }

    return {
      transformValue: this.pawnTranslateValue(values[0]),
      placement: key,
      position: values,
    };
  }

  /**
   * Marks clicked pawn as selected which colors it in the color of logged player.
   * Emits value to ``board.component``.
   * @param pawn clicked pawn
   */
  public placePawn(pawn: Pawn): void {
    this._possiblePawnPlacements.update((pawns) => {
      return pawns.map((p) => {
        return { ...p, selected: p.transformValue === pawn.transformValue };
      });
    });
    this.setPlacedPawn(pawn);
  }

  private filterValues(
    positionClusters: [Position[]],
    coordinates: Coordinates,
    pathsKey: keyof Paths
  ): Position[][] {
    const pathData = this.roomService.currentRoomValue?.paths[pathsKey];

    if (!pathData) return positionClusters;

    return positionClusters.filter((cluster) => {
      return !cluster.some((position) => {
        const calculatedCoordinates = calculateNearestCoordinates(position, coordinates);
        const path = searchForPathWithGivenCoordinates(calculatedCoordinates, pathData, position);
        const numberOfPathOwners = path?.[1].pathOwners.length;
        return !!numberOfPathOwners;
      });
    });
  }

  private pawnTranslateValuePositionCluster(
    positionCluster: Position[],
    environment: Environment
  ): TranslateValue {
    if (environment === Environment.CITIES) {
      if (compareArrays(positionCluster, ['TOP', 'RIGHT'])) {
        return { left: 42, top: 16 };
      }

      if (compareArrays(positionCluster, ['RIGHT', 'BOTTOM'])) {
        return { left: 65, top: 65 };
      }

      if (compareArrays(positionCluster, ['BOTTOM', 'LEFT'])) {
        return { left: 16, top: 42 };
      }

      if (compareArrays(positionCluster, ['LEFT', 'TOP'])) {
        return { left: 16, top: 16 };
      }
    }

    return { left: 42, top: 42 };
  }

  private pawnTranslateValue(position: Position): TranslateValue {
    switch (position) {
      case Position.TOP:
        return { left: 42, top: 7 };
      case Position.RIGHT:
        return { left: 70, top: 42 };
      case Position.BOTTOM:
        return { left: 42, top: 70 };
      case Position.LEFT:
        return { left: 7, top: 42 };
    }
  }

  private setPlacedPawn(placedPawn: Pawn | null): void {
    this._placedPawn.set(placedPawn);
  }
}
