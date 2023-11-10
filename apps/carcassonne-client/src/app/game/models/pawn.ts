import { Position } from './Tile';

export interface Pawn {
  transformValue: string;
  position: Position[];
  placement: string;
  selected?: boolean;
}
