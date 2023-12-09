import { ExtendedTile, PathData, Player, RoomAbstract } from '@carcasonne-mr/shared-interfaces';
import { Injectable } from '@nestjs/common';
import { copy } from '@shared-functions';

@Injectable()
export class FollowerService {
  public removeFollowersFromTiles(board: ExtendedTile[], tilesId: string[]): ExtendedTile[] {
    return board.map((tile) => {
      const removeTileFallower = tilesId.some((id) => id === tile.id);
      return {
        ...tile,
        fallowerDetails: removeTileFallower ? null : tile.fallowerDetails,
        isFollowerPlaced: removeTileFallower ? false : tile.isFollowerPlaced,
      };
    });
  }

  public clearFollowersFromCompletedPaths(
    recentlyCompletedPaths: [string, PathData][],
    board: ExtendedTile[]
  ) {
    const tileIds = recentlyCompletedPaths.flatMap((pathArray) => {
      const path = pathArray[1];
      return Array.from(path.countedTiles.keys());
    });

    return this.removeFollowersFromTiles(board, tileIds);
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
