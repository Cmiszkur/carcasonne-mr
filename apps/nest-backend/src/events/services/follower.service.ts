import {
  ExtendedTile,
  PathData,
  Player,
  Position,
  RoomAbstract,
} from '@carcasonne-mr/shared-interfaces';
import { Injectable } from '@nestjs/common';
import { compareArrays, copy, isString } from '@shared-functions';

@Injectable()
export class FollowerService {
  public removeFollowersFromTiles(
    board: ExtendedTile[],
    tiles: (string | { id: string; positions: Position[] })[]
  ): ExtendedTile[] {
    return board.map((tile) => {
      const removeTileFollower = tiles.some((v) => {
        if (isString(v)) {
          return v === tile.id;
        } else {
          return (
            v.id === tile.id && compareArrays(v.positions, tile.fallowerDetails?.position || [])
          );
        }
      });

      return {
        ...tile,
        fallowerDetails: removeTileFollower ? null : tile.fallowerDetails,
        isFollowerPlaced: removeTileFollower ? false : tile.isFollowerPlaced,
      };
    });
  }

  public clearFollowersFromCompletedPaths(
    recentlyCompletedPaths: [string, PathData][],
    board: ExtendedTile[]
  ) {
    const tiles = recentlyCompletedPaths.flatMap((pathArray) => {
      const path = pathArray[1];
      return Array.from(path.countedTiles.entries()).map((countedTile) => {
        return { id: countedTile[0], positions: Array.from(countedTile[1].checkedPositions) };
      });
    });

    return this.removeFollowersFromTiles(board, tiles);
  }

  /**
   * Removes fallower from player.
   * @param room
   * @param username
   */
  public removeFallowerFromPlayer(room: RoomAbstract, username: string): Player[] {
    const copiedPlayers = copy(room.players);
    const playerIndex = this.currentPlayerIndex(copiedPlayers, username);
    copiedPlayers[playerIndex].followers -= 1;
    return copiedPlayers;
  }

  public playerHasEnoughFollowers(players: Player[], username: string): boolean {
    const playerIndex = this.currentPlayerIndex(players, username);
    return players[playerIndex].followers > 0;
  }

  private currentPlayerIndex(players: Player[], username: string): number {
    return players.findIndex((p) => p.username === username);
  }
}
