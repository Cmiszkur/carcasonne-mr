import { EmptyTile, ExtendedTile, TilesAbstract } from '../tiles';
import { BoardMove, Paths, Player, TileAndPlayer } from './room-types';

export abstract class RoomAbstract {
  abstract board: ExtendedTile[];
  abstract players: Player[];
  abstract boardMoves: BoardMove[];
  abstract lastChosenTile: TileAndPlayer | null;
  abstract tilesLeft: TilesAbstract[];
  abstract gameStarted: boolean;
  abstract gameEnded: boolean;
  abstract roomId: string;
  abstract numberOfPlayers: number;
  abstract roomHost: string;
  abstract hostLeftDate: Date | null;
  abstract paths: Paths;
  abstract emptyTiles: EmptyTile[];
}
