import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  constructor() {}
}
