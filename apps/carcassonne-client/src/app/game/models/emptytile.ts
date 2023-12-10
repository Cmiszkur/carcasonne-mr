import { Coordinates, Environment, TranslateValue } from '@carcasonne-mr/shared-interfaces';

export interface Emptytile {
  top?: Environment;
  right?: Environment;
  bottom?: Environment;
  left?: Environment;
  position: TranslateValue | null;
  coordinates: Coordinates;
  id: string;
}
