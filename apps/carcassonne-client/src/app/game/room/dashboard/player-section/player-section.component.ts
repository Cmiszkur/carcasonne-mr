import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Player } from '@carcasonne-mr/shared-interfaces';

@Component({
  selector: 'app-player-section',
  templateUrl: './player-section.component.html',
  styleUrls: ['./player-section.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSectionComponent {
  /**
   * Array with length equal to number of meeples the players have.
   * Used to iterate over in HTML template.
   */
  public arrayToIterate: Array<number>;

  private _player: Player | null;

  constructor() {
    this.arrayToIterate = Array(1).fill(1);
    this._player = null;
  }

  public get player(): Player | null {
    return this._player;
  }

  /**
   * Sets player and then fills array to iterate with number of elements
   * equal to number of meeples.
   */
  @Input() public set player(player: Player | null) {
    this._player = player;
    this.arrayToIterate = Array(player?.followers).fill(1);
  }
}
