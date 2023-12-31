import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Player } from '@carcasonne-mr/shared-interfaces';

@Component({
  selector: 'app-player-table-cell',
  templateUrl: './player-table-cell.component.html',
  styleUrls: ['./player-table-cell.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerTableCellComponent {
  @Input() players: Player[];

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.players = [];
    iconRegistry.addSvgIcon(
      'meeple',
      sanitizer.bypassSecurityTrustResourceUrl('assets/SVG/meeple.svg')
    );
  }
}
