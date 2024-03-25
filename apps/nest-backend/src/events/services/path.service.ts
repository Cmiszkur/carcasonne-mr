import { Injectable } from '@nestjs/common';
import { Room } from '../schemas/room.schema';
import * as crypto from 'crypto';
import {
  calculateNearestCoordinates,
  compareArrays,
  copy,
  searchForPathWithGivenCoordinates,
} from '@shared-functions';
import {
  Paths,
  PointCheckingAnswer,
  Coordinates,
  CountedTile,
  CountedTiles,
  ExtendedTile,
  FollowerDetails,
  PathData,
  PathDataMap,
  Position,
  TileValues,
  Environment,
} from '@carcasonne-mr/shared-interfaces';
import { PointCountingService } from './point-counting.service';

@Injectable()
export class PathService {
  constructor(
    private pointCountingService: PointCountingService
  ) {}

  private get emptyPathData(): PathData {
    return {
      countedTiles: new Map<string, CountedTile>(),
      pathOwners: [],
      completed: false,
      points: 0,
    };
  }

  public checkNewTile(room: Room, placedTile: ExtendedTile): PointCheckingAnswer {
    const copiedPlacedTile: ExtendedTile = copy(placedTile);
    const paths = copy(room.paths);
    const board = copy(room.board);
    const uncompletedPaths = this.filterCompletedPaths(paths);
    const uncompletedRoadsPathDataMap: PathDataMap = uncompletedPaths.roads;
    const uncompletedCitiesPathDataMap: PathDataMap = uncompletedPaths.cities;
    const placedFallower: FollowerDetails | undefined = copiedPlacedTile.fallowerDetails;
    const cities: [Position[]] | undefined = copiedPlacedTile.tileValuesAfterRotation?.cities;
    const roads: [Position[]] | undefined = copiedPlacedTile.tileValuesAfterRotation?.roads;
    const coordinates: Coordinates = copiedPlacedTile.coordinates;
    const placedTileId = copiedPlacedTile.id;
    const newOrUpdatedPathIds: Set<string> = new Set();
    const deletedPathIds: Set<string> = new Set();

    if (roads) {
      this.checkAndMergeNearestPaths(
        roads,
        coordinates,
        uncompletedRoadsPathDataMap,
        placedTileId,
        Environment.ROADS,
        newOrUpdatedPathIds,
        deletedPathIds,
        copiedPlacedTile.tile.extraPoints,
        placedFallower
      );
    }

    if (cities) {
      this.checkAndMergeNearestPaths(
        cities,
        coordinates,
        uncompletedCitiesPathDataMap,
        placedTileId,
        Environment.CITIES,
        newOrUpdatedPathIds,
        deletedPathIds,
        copiedPlacedTile.tile.extraPoints,
        placedFallower
      );
    }

    this.checkPathCompletion(uncompletedRoadsPathDataMap, board, newOrUpdatedPathIds);
    this.checkPathCompletion(uncompletedCitiesPathDataMap, board, newOrUpdatedPathIds);

    deletedPathIds.forEach((pathId) => {
      paths.roads.delete(pathId);
      paths.cities.delete(pathId);
    });

    const mergedPaths = {
      cities: new Map([...paths.cities, ...uncompletedCitiesPathDataMap]),
      roads: new Map([...paths.roads, ...uncompletedRoadsPathDataMap]),
    };

    return {
      paths: mergedPaths,
      recentlyCompletedPaths: this.recentlyCompletedPaths(
        new Map([...uncompletedPaths.cities, ...uncompletedPaths.roads]),
        newOrUpdatedPathIds
      ),
    };
  }

  private checkAndMergeNearestPaths(
    positionSets: [Position[]],
    coordinates: Coordinates,
    pathDataMap: PathDataMap,
    tileId: string,
    tileValuesKey: keyof TileValues,
    newOrUpdatedPathIds: Set<string>,
    deletedPathIds: Set<string>,
    extraPoints?: boolean,
    placedFallower?: FollowerDetails
  ): void {
    console.log('positionSets', positionSets);
    positionSets.forEach((positionSet) => {
      const pathDataMapRecordArray: [string, PathData][] = [];
      let pathId: string;

      positionSet.forEach((position) => {
        const nearestTileCoordinates: Coordinates | null = calculateNearestCoordinates(
          position,
          coordinates
        );

        if (nearestTileCoordinates) {
          const pathDataMapRecord = searchForPathWithGivenCoordinates(
            nearestTileCoordinates,
            pathDataMap,
            position
          );

          if (pathDataMapRecord) pathDataMapRecordArray.push(pathDataMapRecord);
        }
      });

      if (pathDataMapRecordArray.length >= 2) {
        pathId = this.mergePaths(pathDataMapRecordArray, pathDataMap, deletedPathIds);
      } else {
        pathId = pathDataMapRecordArray[0]
          ? pathDataMapRecordArray[0][0]
          : this.initializePath(pathDataMap);
      }

      this.updatePathData(
        pathDataMap,
        tileId,
        pathId,
        coordinates,
        tileValuesKey,
        newOrUpdatedPathIds,
        placedFallower,
        extraPoints,
        ...positionSet
      );
    });
  }

  private mergePaths(
    pathDataMapRecordArray: [string, PathData][],
    pathDataMap: PathDataMap,
    deletedPathIds: Set<string>
  ): string {
    const mergedCountedTiles: CountedTiles = new Map<string, CountedTile>();
    let mergedOwners: string[] = [];
    let mergedPoints = 0;
    pathDataMapRecordArray.forEach(([pathId, pathData]) => {
      //Deleting merged paths
      pathDataMap.delete(pathId);
      deletedPathIds.add(pathId);
      //Merging owners
      mergedOwners.push(...pathData.pathOwners);
      //Merging tiles
      pathData.countedTiles.forEach((countedTile, tileId) => {
        const countedMergedTile = mergedCountedTiles.get(tileId);
        if (countedMergedTile) {
          countedTile.checkedPositions.forEach((position) =>
            countedMergedTile.checkedPositions.add(position)
          );
        } else {
          mergedCountedTiles.set(tileId, countedTile);
        }
      });
      //Merging points
      mergedPoints += pathData.points || 0;
    });
    const mergedPathData: PathData = {
      points: mergedPoints,
      pathOwners: mergedOwners,
      countedTiles: mergedCountedTiles,
      completed: false,
    };

    //Setting new merged path
    const newPathId = crypto.randomUUID();
    pathDataMap.set(newPathId, mergedPathData);
    return newPathId;
  }

  private extractNearestTile(
    board: ExtendedTile[],
    coordinates: Coordinates,
    position: Position
  ): ExtendedTile | null {
    const nearestTileCoordinates: Coordinates | null = calculateNearestCoordinates(
      position,
      coordinates
    );
    return nearestTileCoordinates
      ? this.findTileWithGivenCoordinates(board, nearestTileCoordinates)
      : null;
  }

  private findTileWithGivenCoordinates(
    board: ExtendedTile[],
    coordinates: Coordinates
  ): ExtendedTile | null {
    return (
      board.find(
        (extendedTile) =>
          extendedTile.coordinates?.x === coordinates.x &&
          extendedTile.coordinates?.y === coordinates.y
      ) || null
    );
  }

  private isTileCompleted(
    positionSet: Position[],
    board: ExtendedTile[],
    coordinates: Coordinates
  ): boolean {
    const isCompleted: boolean[] = [];

    positionSet.forEach((position) => {
      const nextTile = this.extractNearestTile(board, coordinates, position);
      isCompleted.push(!!nextTile);
    });
    return isCompleted.every(Boolean);
  }

  /**
   * @returns pathID
   */
  private initializePath(pathData: PathDataMap): string {
    const pathId: string = crypto.randomUUID();
    pathData.set(pathId, this.emptyPathData);
    return pathId;
  }

  private updatePathData(
    pathDataMap: PathDataMap,
    tileId: string,
    pathId: string,
    coordinates: Coordinates,
    tileValuesKey: keyof TileValues,
    newOrUpdatedPathIds: Set<string>,
    placedFallower?: FollowerDetails,
    extraPoints?: boolean,
    ...positions: Position[]
  ): void {
    const searchedPathData = pathDataMap.get(pathId);
    if (!searchedPathData) return;
    newOrUpdatedPathIds.add(pathId);
    this.setOrUpdateCountedTile(tileId, coordinates, searchedPathData, ...positions);
    this.updatePathOwners(tileId, searchedPathData, placedFallower);
    searchedPathData.points = this.pointCountingService.countPoints(
      searchedPathData,
      tileValuesKey,
      extraPoints
    );
  }

  private setOrUpdateCountedTile(
    tileId: string,
    coordinates: Coordinates,
    searchedPathData?: PathData,
    ...positions: Position[]
  ): void {
    const updatedTile = searchedPathData?.countedTiles.get(tileId);
    if (updatedTile) {
      positions.forEach((position) => updatedTile.checkedPositions.add(position));
    } else {
      searchedPathData?.countedTiles?.set(tileId, {
        isPathCompleted: false,
        checkedPositions: new Set(positions),
        coordinates,
      });
    }
  }

  private updatePathOwners(
    tileId: string,
    searchedPathData: PathData,
    placedFallower?: FollowerDetails
  ): void {
    const checkedPositions = Array.from(
      searchedPathData.countedTiles.get(tileId)?.checkedPositions || []
    );

    if (!placedFallower || searchedPathData.pathOwners.length || !checkedPositions.length) {
      return;
    }

    const fallowerOwner = placedFallower.username;
    const placedFollowerPositions = placedFallower.position;

    if (compareArrays(placedFollowerPositions, checkedPositions)) {
      searchedPathData.pathOwners.push(fallowerOwner);
    }
  }

  private filterCompletedPaths(paths: Paths): Paths {
    return {
      cities: this.filterCompletedPathDataMap(paths.cities),
      roads: this.filterCompletedPathDataMap(paths.roads),
    };
  }

  private filterCompletedPathDataMap(pathDataMap: PathDataMap): PathDataMap {
    return new Map(Array.from(pathDataMap).filter(([key, value]) => !value.completed));
  }

  private checkPathCompletion(
    pathDataMap: PathDataMap,
    board: ExtendedTile[],
    newOrUpdatedPathIds: Set<string>
  ): void {
    newOrUpdatedPathIds.forEach((newOrUpdatedPathId) => {
      const checkedPath = pathDataMap.get(newOrUpdatedPathId);
      if (checkedPath) {
        checkedPath.completed = this.checkAllTilesComplition(board, checkedPath);
      }
    });
  }

  private checkAllTilesComplition(board: ExtendedTile[], checkedPath: PathData): boolean {
    const isCompleted: boolean[] = [];
    const checkedPathTiles = Array.from(checkedPath.countedTiles.values());
    checkedPathTiles.forEach((checkedPathTile) => {
      const isTileCompleted: boolean = this.isTileCompleted(
        Array.from(checkedPathTile.checkedPositions.values()),
        board,
        checkedPathTile.coordinates
      );
      isCompleted.push(isTileCompleted);
    });
    return isCompleted.every(Boolean);
  }

  private recentlyCompletedPaths(
    pathDataMap: PathDataMap,
    newOrUpdatedPathIds: Set<string>
  ): [string, PathData][] {
    return Array.from(pathDataMap).filter(([pathId, pathData]) => {
      return newOrUpdatedPathIds.has(pathId) && pathData.completed;
    });
  }
}
