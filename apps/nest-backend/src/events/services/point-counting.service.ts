import { ExtendedTile, PathData, Player, TileValues } from '@carcasonne-mr/shared-interfaces';
import { Injectable } from '@nestjs/common';
import { copy } from '@shared-functions';
import { TilesService } from './tiles.service';
import { ChurchCounting } from '../interfaces';

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
  public countChurchPoints(
    board: ExtendedTile[],
    placedTile: ExtendedTile,
    gameEnded: boolean
  ): number {
    const numberOfTilesAround: number = this.tilesService.numberOfTilesAround(board, placedTile);

    return gameEnded && numberOfTilesAround !== 8 ? numberOfTilesAround : numberOfTilesAround + 1;
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
      const pointsFromChurch = this.countChurchPoints(board, tile, gameEnded);
      const churchCompleted = !gameEnded && pointsFromChurch === 9;

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
              points: churchCompleted ? player.points + pointsFromChurch : player.points,
              followers: churchCompleted ? player.followers + 1 : player.followers,
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
    let copiedPlayers = copy(players);

    completedPaths.forEach((path) => {
      const checkedPath = path[1];

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
          points: playerDominantOrEqual ? player.points + checkedPath.points : player.points,
          followers: playerDominantOrEqual ? player.followers + playerFallowers : player.followers,
        };
      });
    });

    return copiedPlayers;
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
}
