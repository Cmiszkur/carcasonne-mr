import { RoomError } from './socket';
import { Tile } from '@carcasonne-mr/shared-interfaces';

export interface TileAndPlayer {
  tile: Tile;
  player: string;
}

export interface PlayerOptions {
  color: PlayersColors | null;
}

export enum PlayersColors {
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  RED = 'red',
}

export interface SnackBarError {
  error: RoomError;
  errorMessage?: string;
}
