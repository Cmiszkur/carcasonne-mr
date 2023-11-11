import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Player } from '../../models/Room';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent implements OnInit {
  /**
   * Currently logged in user.
   */
  public player: Player | null;
  /**
   * All players beside logged in user.
   */
  public restOfThePlayers: Player[];

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private roomService: RoomService
  ) {
    this.restOfThePlayers = [];
    this.player = null;
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
    this.roomService.players.subscribe((player) => {
      this.player = player?.loggedPlayer || null;
      this.restOfThePlayers = player?.otherPlayers || [];
    });
  }
}
