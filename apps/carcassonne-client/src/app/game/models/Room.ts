import { Tile } from '@carcasonne-mr/shared-interfaces';

export interface TileAndPlayer {
  tile: Tile;
  player: string;
}

export interface PlayerOptions {
  color: PlayersColors | null;
  confirmed: boolean;
}

export enum PlayersColors {
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  RED = 'red',
}
