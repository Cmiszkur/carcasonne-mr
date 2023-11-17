import { Environment } from '@carcasonne-mr/shared-interfaces';

export interface Emptytile {
  top?: Environment;
  right?: Environment;
  bottom?: Environment;
  left?: Environment;
  position: string;
}
