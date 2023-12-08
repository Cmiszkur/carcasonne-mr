import { Injectable } from '@nestjs/common';
import { Room } from '../schemas/room.schema';
import * as crypto from 'crypto';
import {
  calculateNearestCoordinates,
  copy,
  searchForPathWithGivenCoordinates,
} from '@shared-functions';
import {
  Paths,
  Player,
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
  constructor(private pointCountingService: PointCountingService) {}

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
    const paths = room.paths;
    const uncompletedPaths = this.filterCompletedPaths(paths);
    const uncompletedRoadsPathDataMap: PathDataMap = uncompletedPaths.roads;
    const uncompletedCitiesPathDataMap: PathDataMap = uncompletedPaths.cities;
    const placedFallower: FollowerDetails | undefined = copiedPlacedTile.fallowerDetails;
    const players: Player[] = room.players;
    const cities: [Position[]] | undefined = copiedPlacedTile.tileValuesAfterRotation?.cities;
    const roads: [Position[]] | undefined = copiedPlacedTile.tileValuesAfterRotation?.roads;
    const coordinates: Coordinates = copiedPlacedTile.coordinates;
    const placedTileId = copiedPlacedTile.id;
    const newOrUpdatedPathIds: Set<string> = new Set();

    if (roads) {
      this.checkAndMergeNearestPaths(
        roads,
        coordinates,
        uncompletedRoadsPathDataMap,
        placedTileId,
        Environment.ROADS,
        newOrUpdatedPathIds,
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
        copiedPlacedTile.tile.extraPoints,
        placedFallower
      );
    }

    this.checkPathCompletion(uncompletedRoadsPathDataMap, room.board, newOrUpdatedPathIds);
    this.checkPathCompletion(uncompletedCitiesPathDataMap, room.board, newOrUpdatedPathIds);

    const mergedPaths = {
      cities: new Map([...paths.cities, ...uncompletedCitiesPathDataMap]),
      roads: new Map([...paths.roads, ...uncompletedRoadsPathDataMap]),
    };

    this.logPaths(mergedPaths.roads, mergedPaths.cities);
    return {
      paths: mergedPaths,
      players: this.pointCountingService.updatePlayersPointsFromPathData(
        new Map([...uncompletedPaths.cities, ...uncompletedPaths.roads]),
        newOrUpdatedPathIds,
        players
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
    extraPoints?: boolean,
    placedFallower?: FollowerDetails
  ): void {
    positionSets.forEach((positionSet) => {
      const pathDataMapRecordArray: [string, PathData][] = [];

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
        this.mergePaths(pathDataMapRecordArray, pathDataMap, placedFallower);
      }

      const pathId: string = pathDataMapRecordArray[0]
        ? pathDataMapRecordArray[0][0]
        : this.initializePath(pathDataMap);

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
    placedFallower?: FollowerDetails
  ): void {
    const mergedCountedTiles: CountedTiles = new Map<string, CountedTile>();
    let mergedOwners: string[] = [];
    let mergedPoints = 0;
    pathDataMapRecordArray.forEach(([pathId, pathData]) => {
      //Deleting merged paths
      pathDataMap.delete(pathId);
      //Merging owners
      mergedOwners = placedFallower?.username
        ? [...pathData.pathOwners, placedFallower.username]
        : pathData.pathOwners;
      //Merging tiles
      pathData.countedTiles.forEach((countedTile, tileId) =>
        mergedCountedTiles.set(tileId, countedTile)
      );
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
    pathDataMap.set(crypto.randomUUID(), mergedPathData);
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
    this.updatePathOwners(searchedPathData, placedFallower);
    this.setOrUpdateCountedTile(tileId, coordinates, searchedPathData, ...positions);
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

  private updatePathOwners(searchedPathData?: PathData, placedFallower?: FollowerDetails): void {
    const fallowerOwner = placedFallower?.username;
    if (searchedPathData && fallowerOwner) {
      if (searchedPathData.pathOwners.some((pathOwner) => pathOwner !== fallowerOwner)) return;
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

  private logPaths(roadsPathDataMap: PathDataMap, citiesPathDataMap: PathDataMap): void {
    roadsPathDataMap.forEach((pathData, pathId) => {
      console.log('roads pathId: ', pathId);
      console.log(' path completed: ', pathData.completed);
      console.log(' path points: ', pathData.points);
      pathData.countedTiles.forEach((countedTile, tileId) => {
        console.log('   tileId: ', tileId);
        console.log('   tile coordinates: ', countedTile.coordinates);
        console.log('   tile checked positions: ', countedTile.checkedPositions);
        console.log('   =============================================');
      });
      console.log('==================================================');
    });

    citiesPathDataMap.forEach((pathData, pathId) => {
      console.log('cities pathId: ', pathId);
      console.log(' path completed: ', pathData.completed);
      console.log(' path points: ', pathData.points);
      pathData.countedTiles.forEach((countedTile, tileId) => {
        console.log('   tileId: ', tileId);
        console.log('   tile coordinates: ', countedTile.coordinates);
        console.log('   tile checked positions: ', countedTile.checkedPositions);
      });
      console.log('==================================================');
    });
  }
}
