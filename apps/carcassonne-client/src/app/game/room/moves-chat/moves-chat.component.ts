import { Component, computed, Signal } from '@angular/core';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';
import { BoardMove, Coordinates, Paths, Player } from '@carcasonne-mr/shared-interfaces';
import { checkIfMostFrequentOrEqualElement, isNotNullish } from '@shared-functions';
import { MovesChatService } from '@carcassonne-client/src/app/game/room/moves-chat/service/moves-chat.service';

export interface BoardMoveChat {
  message: string;
  placedAt: Date;
  coords: Coordinates | null;
}

@Component({
  selector: 'carcasonne-mr-moves-chat',
  templateUrl: './moves-chat.component.html',
  styleUrl: './moves-chat.component.sass',
})
export class MovesChatComponent {
  public boardMoves: Signal<BoardMoveChat[]> = computed(() =>
    this.mapBoardMoves(this.roomService.currentRoomSignal()?.boardMoves || [])
  );
  public paths: Signal<Paths | null> = computed(
    () => this.roomService.currentRoomSignal()?.paths || null
  );
  public players: Signal<Player[]> = computed(
    () => this.roomService.currentRoomSignal()?.players || []
  );
  public latestMoveColor: Signal<string | null> = computed(() => {
    const currentRoomSignal = this.roomService.currentRoomSignal();
    const boardMoves = currentRoomSignal?.boardMoves;
    if (!boardMoves) return null;
    const latestMovePlayer = boardMoves[boardMoves.length - 1].player;
    if (!latestMovePlayer) return null;
    return this.getPlayerColor(this.players(), latestMovePlayer);
  });

  constructor(private roomService: RoomService, public movesChatService: MovesChatService) {}

  public highlightSelectedBoardMove(coords: Coordinates | null) {
    if (!coords) return;

    this.movesChatService.highlightSelectedBoardMove(coords);
  }

  private mapBoardMoves(boardMoves: BoardMove[]): BoardMoveChat[] {
    return boardMoves.flatMap((move) => {
      const player = move.player;

      if (!player) return [];
      if (!move.completedPaths.length) {
        return {
          message: `${move.player} placed new tile`,
          placedAt: move.placedAt,
          coords: move.coordinates,
        };
      }
      return this.mapPaths(move.completedPaths, player).map((message) => {
        return { message, placedAt: move.placedAt, coords: move.coordinates };
      });
    });
  }

  private mapPaths(completedPaths: string[], player: string): string[] {
    const messages: string[] = [];
    const pathsData = completedPaths
      .map((pathId: string) => {
        return this.paths()?.cities?.get(pathId) || this.paths()?.roads?.get(pathId);
      })
      .filter(isNotNullish);

    pathsData.forEach((pathData) => {
      const otherPlayers = this.players().filter((playerr) => playerr.username !== player);

      const isPlayerDominantOrEqual = checkIfMostFrequentOrEqualElement(
        pathData.pathOwners,
        player
      );

      messages.push(
        `${player} placed new tile${
          isPlayerDominantOrEqual ? ` and scored ${pathData.points} points` : ''
        }`
      );

      otherPlayers.forEach((owner) => {
        if (checkIfMostFrequentOrEqualElement(pathData.pathOwners, owner.username)) {
          messages.push(`${owner.username} scored ${pathData.points} points`);
        }
      });
    });

    return messages;
  }

  private getPlayerColor(players: Player[], username: string): string | null {
    return (
      players.filter(isNotNullish).find((player) => player.username === username)?.color ?? null
    );
  }
}
