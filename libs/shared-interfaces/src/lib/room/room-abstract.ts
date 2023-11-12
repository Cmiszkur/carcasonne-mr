import { TilesAbstract } from '../tiles/tiles-abstract';
import { ExtendedTile } from '../tiles/tiles-types';
import { BoardMove, Paths, Player, TileAndPlayer } from './room-types';

export abstract class RoomAbstract {
  abstract readonly board: ExtendedTile[];
  abstract readonly players: Player[];
  abstract readonly boardMoves: BoardMove[];
  abstract readonly lastChosenTile: TileAndPlayer | null;
  abstract readonly tilesLeft: TilesAbstract[];
  abstract readonly gameStarted: boolean;
  abstract readonly gameEnded: boolean;
  abstract readonly roomId: string;
  abstract readonly numberOfPlayers: number;
  abstract readonly roomHost: string;
  abstract readonly hostLeftDate: Date | null;
  abstract readonly paths: Paths;
}
