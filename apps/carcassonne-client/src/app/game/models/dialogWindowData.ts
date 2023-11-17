import { ShortenedRoom } from '@carcasonne-mr/shared-interfaces';
import { PlayerOptions } from './Room';

export interface PlayerOptionsData {
  playerOptions: PlayerOptions;
  shortenedRoom: ShortenedRoom | null;
}
