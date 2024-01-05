import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RoomService } from '../services/room.service';
import { BaseComponent } from '../../commons/components/base/base.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent extends BaseComponent implements OnDestroy {
  constructor(private roomService: RoomService) {
    super();
    this.roomService
      .receiveOneResponseAndUpdateRoom('game_started')
      .pipe(takeUntil(this.destroyed))
      .subscribe();
    this.roomService
      .receiveResponseAndUpdatePlayers('new_player_joined')
      .pipe(takeUntil(this.destroyed))
      .subscribe();
    this.roomService
      .receiveResponseAndUpdatePlayers('player_left')
      .pipe(takeUntil(this.destroyed))
      .subscribe();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.roomService.removeManyListeners('new_player_joined', 'player_left', 'game_started');
    this.roomService.disconnect();
  }
}
