import { Component, computed, Signal } from '@angular/core';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';
import { BoardMove, Coordinates, Paths, Player } from '@carcasonne-mr/shared-interfaces';
import { isNotNullish } from '@shared-functions';
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
  public latestMoveColor: Signal<string | null> = computed(() => {
    const currentRoomSignal = this.roomService.currentRoomSignal();
    const boardMoves = currentRoomSignal?.boardMoves;
    if (!boardMoves) return null;
    const players = currentRoomSignal.players;
    const latestMovePlayer = boardMoves[boardMoves.length - 1].player;
    if (!latestMovePlayer) return null;
    return this.getPlayerColor(players, latestMovePlayer);
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
        return this.paths()?.cities?.get(pathId) || this.paths()?.cities?.get(pathId);
      })
      .filter(isNotNullish);
    if (pathsData.length > 1) {
      // return void;
    }

    if (pathsData.length === 1) {
      const pathData = pathsData[0];
      messages.push(`${player} placed new tile and scored ${pathData.points} points`);

      if (pathData.pathOwners.length > 1) {
        const otherPathOwners = pathData.pathOwners.filter((owner) => owner !== player);
        otherPathOwners.forEach((owner) =>
          messages.push(`${owner} scored ${pathData.points} points`)
        );
      }
    }

    return messages;
  }

  private getPlayerColor(players: Player[], username: string): string | null {
    return (
      players.filter(isNotNullish).find((player) => player.username === username)?.color ?? null
    );
  }
}
