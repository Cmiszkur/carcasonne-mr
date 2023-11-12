import { Tile } from './tiles-types';

export abstract class TilesAbstract {
  abstract readonly id: string;
  abstract readonly tile: Tile;
  abstract readonly numberOfTiles: number;
}
