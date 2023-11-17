import { Player } from '@carcasonne-mr/shared-interfaces';

export interface Players {
  loggedPlayer: Player | null;
  otherPlayers: Player[];
}
