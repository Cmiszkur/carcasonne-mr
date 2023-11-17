import { Position, Environment } from '@carcasonne-mr/shared-interfaces';

export interface Pawn {
  transformValue: string;
  position: Position[];
  placement: Environment;
  selected?: boolean;
}
