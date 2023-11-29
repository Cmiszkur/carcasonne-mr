import { BaseComponent } from '@carcassonne-client/src/app/commons/components/base/base.component';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RoomService } from '../../services/room.service';
import { Player } from '@carcasonne-mr/shared-interfaces';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent extends BaseComponent implements OnInit {
  /**
   * Currently logged in user.
   */
  public player = signal<Player | null>(null);
  /**
   * All players beside logged in user.
   */
  public restOfThePlayers = signal<Player[]>([]);

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private roomService: RoomService
  ) {
    super();
    iconRegistry.addSvgIcon(
      'follower',
      sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/follower.svg')
    );
  }

  ngOnInit(): void {
    this.listenForPlayersChange();
  }

  /**
   * Subscribes to players observable and sets ``this.player`` and ``this.restOfThePlayers`` fields.
   */
  private listenForPlayersChange(): void {
    this.roomService.players.pipe(takeUntil(this.destroyed)).subscribe((player) => {
      this.player.set(player?.loggedPlayer || null);
      this.restOfThePlayers.set(player?.otherPlayers || []);
    });
  }
}
