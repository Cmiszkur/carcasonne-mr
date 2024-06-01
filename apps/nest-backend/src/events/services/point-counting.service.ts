import {
  ExtendedTile,
  PathData,
  Paths,
  Player,
  TileValues,
} from '@carcasonne-mr/shared-interfaces';
import { Injectable } from '@nestjs/common';
import { copy, extractUncompletedPathData } from '@shared-functions';
import { TilesService } from './tiles.service';
import { ChurchCounting } from '../interfaces';

type ExtendedPathData = PathData & { isCities?: boolean };

@Injectable()
export class PointCountingService {
  constructor(private tilesService: TilesService) {}

  /**
   * Checks tiles around passed tile and counts points.
   * For each tile around (including one in the corner) there is one point.
   * There are two ways of suming up the points:
   * * During the game player is only awarded points if all nine surrounding
   * are placed
   * * When the game is finished player gets points no matter the completion,
   * but without one point that would be given when whole set is completed
   */
  public countChurchPoints(board: ExtendedTile[], placedTile: ExtendedTile): number {
    const numberOfTilesAround: number = this.tilesService.numberOfTilesAround(board, placedTile);

    return numberOfTilesAround + 1;
  }

  public updatePlayersPointsFromChurches(
    board: ExtendedTile[],
    tilesWithChurches: ExtendedTile[],
    gameEnded: boolean,
    players: Player[]
  ): ChurchCounting {
    let copiedPlayers = copy(players);
    const tilesWithCompletedChurches: string[] = [];

    tilesWithChurches.forEach((tile) => {
      const pointsFromChurch = this.countChurchPoints(board, tile);
      const churchCompleted = pointsFromChurch === 9;

      if (!pointsFromChurch || !tile.isFollowerPlaced) {
        return;
      }

      if (churchCompleted) {
        tilesWithCompletedChurches.push(tile.id);
      }

      copiedPlayers = copiedPlayers.map((player) => {
        const playerWasChurchOwner = player.username === tile.fallowerDetails.username;

        return playerWasChurchOwner
          ? {
              ...player,
              points:
                churchCompleted || gameEnded ? player.points + pointsFromChurch : player.points,
              followers: churchCompleted && !gameEnded ? player.followers + 1 : player.followers,
            }
          : player;
      });
    });

    return { updatedPlayers: copiedPlayers, tilesWithCompletedChurches };
  }

  public updatePlayersPointsFromPathData(
    completedPaths: [string, PathData][],
    players: Player[]
  ): Player[] {
    const pathDataArr = completedPaths.map((v) => v[1]);
    return this.updatePlayerPoints(pathDataArr, players, false);
  }

  public updatePlayersPointsFromPaths(paths: Paths, players: Player[]): Player[] {
    const cities = extractUncompletedPathData(paths.cities).map((path) => ({
      ...path,
      isCities: true,
    }));
    const roads = extractUncompletedPathData(paths.roads);

    return this.updatePlayerPoints([...cities, ...roads], players, true);
  }

  public countPoints(
    pathData: PathData,
    tileValuesKey: keyof TileValues,
    extraPoints = false
  ): number {
    const isCities = tileValuesKey === 'cities';
    const basePoints = isCities ? 2 : 1;
    return pathData.points + (extraPoints && isCities ? basePoints * 2 : basePoints);
  }

  private isPlayerDominantOrEqual(checkedPathOwners: string[], username: string): boolean {
    if (checkedPathOwners.length === 0) {
      return false;
    }

    const frequencyMap: Record<string, number> = {};
    let maxCount = 1;

    for (const el of checkedPathOwners) {
      if (frequencyMap[el] == null) {
        frequencyMap[el] = 1;
      } else {
        frequencyMap[el]++;
      }

      if (frequencyMap[el] > maxCount) {
        maxCount = frequencyMap[el];
      }
    }
    const mostFrequentOwners: string[] = [];

    for (const el in frequencyMap) {
      if (frequencyMap[el] === maxCount) {
        mostFrequentOwners.push(el);
      }
    }

    return mostFrequentOwners.some((owner) => owner === username);
  }

  private updatePlayerPoints(
    pathDataArr: ExtendedPathData[],
    players: Player[],
    gameEnded: boolean
  ): Player[] {
    let copiedPlayers = copy(players);

    pathDataArr.forEach((checkedPath) => {
      const checkedPathOwners = checkedPath.pathOwners || [];
      copiedPlayers = copiedPlayers.map((player) => {
        const playerFallowers = checkedPathOwners.filter(
          (pathOwner) => pathOwner === player.username
        ).length;

        const playerDominantOrEqual = this.isPlayerDominantOrEqual(
          checkedPathOwners,
          player.username
        );

        return {
          ...player,
          points: playerDominantOrEqual
            ? player.points +
              (gameEnded && checkedPath.isCities ? checkedPath.points / 2 : checkedPath.points)
            : player.points,
          followers: gameEnded ? player.followers : player.followers + playerFallowers,
        };
      });
    });

    return copiedPlayers;
  }
}
