import { Player } from './Room';

export interface Players {
  loggedPlayer: Player | null;
  otherPlayers: Player[];
}
