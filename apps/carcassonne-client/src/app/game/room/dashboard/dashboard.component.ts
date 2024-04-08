import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RoomService } from '../../services/room.service';
import { Player } from '@carcasonne-mr/shared-interfaces';
import { Players } from '@carcassonne-client/src/app/game/models/Players';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public players = computed<Player[]>(() => {
    const players: Players | null = this.roomService.players();
    return [players?.loggedPlayer, ...(players?.otherPlayers || [])].filter(Boolean) as Player[];
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
