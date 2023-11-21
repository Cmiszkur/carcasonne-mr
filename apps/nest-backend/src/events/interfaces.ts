import { Player } from '@carcasonne-mr/shared-interfaces';

export interface ChurchCounting {
  updatedPlayers: Player[];
  tilesWithCompletedChurches: string[];
}
