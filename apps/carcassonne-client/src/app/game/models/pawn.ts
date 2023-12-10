import { Position, Environment, TranslateValue } from '@carcasonne-mr/shared-interfaces';

export interface Pawn {
  transformValue: TranslateValue;
  position: Position[];
  placement: Environment;
  selected?: boolean;
}
