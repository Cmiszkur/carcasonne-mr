import { Coordinates, Environment } from '@carcasonne-mr/shared-interfaces';

export interface Emptytile {
  top?: Environment;
  right?: Environment;
  bottom?: Environment;
  left?: Environment;
  position: { left: number; top: number } | null;
  coordinates: Coordinates;
  id: string;
}
