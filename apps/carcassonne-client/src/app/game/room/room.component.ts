import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RoomService } from '../services/room.service';
import { BaseComponent } from '../../commons/components/base/base.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.sass'],
})
export class RoomComponent extends BaseComponent implements OnDestroy {
  /**
   * Subscribes for game starting event.
   * @private
   */
  private gameStartedSubscription: Subscription;

  /**
   * Subscribes for new player joining event.
   * @private
   */
  private newPlayerJoinedSubscription: Subscription;

  /**
   * Subscribes for player leaving event.
   * @private
   */
  private playerLeftSubscription: Subscription;

  constructor(private roomService: RoomService) {
    super();
    this.gameStartedSubscription = this.roomService.receiveGameStartedResponse().pipe(takeUntil(this.destroyed)).subscribe();
    this.newPlayerJoinedSubscription = this.roomService.receiveNewPlayerJoinedResponse().pipe(takeUntil(this.destroyed)).subscribe();
    this.playerLeftSubscription = this.roomService.receivePlayerLeftResponse().pipe(takeUntil(this.destroyed)).subscribe();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this.roomService.removeManyListeners('new_player_joined', 'player_left', 'game_started');
    this.roomService.disconnect();
  }
}
