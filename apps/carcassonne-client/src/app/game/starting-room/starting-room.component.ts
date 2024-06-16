import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerOptions } from '../models/Room';
import { RoomService } from '../services/room.service';
import { ShortenedRoom } from '@carcasonne-mr/shared-interfaces';
import { AuthService } from '@carcassonne-client/src/app/user/services/auth.service';
import { generateRandomString } from '@shared-functions';
import { PlayerOptionsData } from '@carcassonne-client/src/app/game/models/dialogWindowData';

@Component({
  selector: 'app-starting-room',
  templateUrl: './starting-room.component.html',
  styleUrls: ['./starting-room.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartingRoomComponent implements OnInit {
  /**
   * All available rooms.
   */
  public availableRooms: ShortenedRoom[];

  constructor(
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.availableRooms = [];
  }

  ngOnInit(): void {
    this.availableRooms = this.roomService.availableRooms || [];
    this.createGameAfterRedirect();
  }

  /**
   * Navigates to waiting room and sets query params.
   * @param options - ``{ color: string }``
   */
  public joinRoom(options: PlayerOptionsData): void {
    if (!options.playerOptions.confirmed) {
      return;
    }

    this.navigateToWaitingRoom(options.shortenedRoom?.roomId ?? null, options.playerOptions);
  }

  /**
   * Creates room and on success navigates to waiting room.
   * @param options
   */
  public createRoom(options: PlayerOptionsData): void {
    if (!options.playerOptions.confirmed) {
      return;
    }

    if (!this.authService.user) {
      const redirectId: string = generateRandomString();
      this.authService.redirectId = redirectId;
      this.authService.redirectUrl = `${location.pathname}?color=${options.playerOptions.color}&redirect_id=${redirectId}`;
      return this.navigateToLoginPage();
    }

    this.roomService.createRoom(options.playerOptions?.color).subscribe((createdRoom) => {
      const roomID: string | null = createdRoom.answer?.room?.roomId || null;
      this.navigateToWaitingRoom(roomID, options.playerOptions);
    });
  }

  private createGameAfterRedirect(): void {
    const redirectId = this.route.snapshot.queryParams['redirect_id'];
    if (redirectId && redirectId === this.authService.redirectId) {
      const color = this.route.snapshot.queryParams['color'];
      this.createRoom({ playerOptions: { color, confirmed: true }, shortenedRoom: null });
    }
  }

  /**
   * Navigates to waiting room and sets query params.
   * @param roomID
   * @param options
   * @private
   */
  private navigateToWaitingRoom(roomID: string | null, options: PlayerOptions): void {
    if (!roomID) return;

    this.router.navigate(['./room/waiting-room'], {
      queryParams: { roomID: roomID, ...options },
      relativeTo: this.route,
    });
  }

  private navigateToLoginPage(): void {
    this.router.navigate(['../login'], {
      relativeTo: this.route,
    });
  }
}
