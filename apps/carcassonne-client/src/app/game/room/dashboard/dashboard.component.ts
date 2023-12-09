import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RoomService } from '../../services/room.service';
import { Player } from '@carcasonne-mr/shared-interfaces';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  /**
   * Currently logged in user.
   */
  public player = computed<Player | null>(() => {
    return this.roomService.players()?.loggedPlayer || null;
  });
  /**
   * All players beside logged in user.
   */
  public restOfThePlayers = computed<Player[]>(() => {
    return this.roomService.players()?.otherPlayers || [];
  });

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private roomService: RoomService
  ) {
    iconRegistry.addSvgIcon(
      'follower',
      sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/follower.svg')
    );
  }
}
