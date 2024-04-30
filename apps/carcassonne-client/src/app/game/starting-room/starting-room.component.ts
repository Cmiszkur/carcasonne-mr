import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerOptions } from '../models/Room';
import { RoomService } from '../services/room.service';
import { ShortenedRoom } from '@carcasonne-mr/shared-interfaces';
import { AuthService } from '@carcassonne-client/src/app/user/services/auth.service';

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
  }

  /**
   * Saves selected room and it's id that is later used to join room.
   * @param selectedRoom - room selected from results table.
   */
  public saveSelectedRoom(selectedRoom: ShortenedRoom): void {
    this.roomService.setSelectedRoom(selectedRoom);
  }

  /**
   * Navigates to waiting room and sets query params.
   * @param options - ``{ color: string }``
   */
  public joinRoom(options: PlayerOptions): void {
    this.navigateToWaitingRoom(this.roomService.selectedRoomId, options);
  }

  /**
   * Creates room and on success navigates to waiting room.
   * @param options
   */
  public createRoom(options: PlayerOptions): void {
    if (!this.authService.user) {
      return this.navigateToLoginPage();
    }

    this.roomService.createRoom(options?.color).subscribe((createdRoom) => {
      const roomID: string | null = createdRoom.answer?.room?.roomId || null;
      this.navigateToWaitingRoom(roomID, options);
    });
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
