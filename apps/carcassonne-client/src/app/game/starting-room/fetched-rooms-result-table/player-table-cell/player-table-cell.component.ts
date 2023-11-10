import { Component, Input } from '@angular/core';
import { Player } from 'src/app/game/models/Room';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-player-table-cell',
  templateUrl: './player-table-cell.component.html',
  styleUrls: ['./player-table-cell.component.sass'],
})
export class PlayerTableCellComponent {
  @Input() players: Player[];

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.players = [];
    iconRegistry.addSvgIcon(
      'meeple',
      sanitizer.bypassSecurityTrustResourceUrl('src/assets/SVG/meeple.svg')
    );
  }
}
