import { inject, Pipe, PipeTransform } from '@angular/core';
import { BoardMove, ExtendedTranslatedTile } from '@carcasonne-mr/shared-interfaces';
import { RoomService } from '@carcassonne-client/src/app/game/services/room.service';
import { checkCoordinates, isNotNullish } from '@shared-functions';

@Pipe({
  name: 'tileBorderColor',
  standalone: true,
})
export class TileBorderColorPipe implements PipeTransform {
  private roomService = inject(RoomService);

  transform(tile: ExtendedTranslatedTile, latestBoardMove: BoardMove | null): string | null {
    if (!latestBoardMove) return null;

    const latestBoardMovePlayer = latestBoardMove.player;
    const latestBoardMoveCoordinates = latestBoardMove.coordinates;

    return latestBoardMoveCoordinates &&
      checkCoordinates(tile.coordinates, latestBoardMoveCoordinates)
      ? latestBoardMovePlayer
        ? this.getPlayerColor(latestBoardMovePlayer)
        : null
      : null;
  }

  private getPlayerColor(username: string): string | null {
    const players = this.roomService.players;
    return (
      [players()?.loggedPlayer, ...(players()?.otherPlayers || [])]
        .filter(isNotNullish)
        .find((player) => player.username === username)?.color ?? null
    );
  }
}
