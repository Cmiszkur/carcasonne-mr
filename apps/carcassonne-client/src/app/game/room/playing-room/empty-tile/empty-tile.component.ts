import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateValue } from '@carcasonne-mr/shared-interfaces';

@Component({
  selector: 'app-empty-tiles',
  templateUrl: './empty-tile.component.html',
  styleUrls: ['./empty-tile.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyTileComponent {
  @Input() translate: TranslateValue | null = null;

  constructor() {}
}
