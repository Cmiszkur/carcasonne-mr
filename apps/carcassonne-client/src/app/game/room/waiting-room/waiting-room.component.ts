import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.sass'],
})
export class WaitingRoomComponent implements OnInit {
  constructor(private roomService: RoomService, private router: Router, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.listenForCurrentRoomChanges();
  }

  /**
   * Starts the game in current room.
   */
  public startGame(): void {
    this.roomService.startGame();
  }

  /**
   * Listen for changes in current room, if game is started player will be
   * navigated to playing room.
   * @private
   */
  private listenForCurrentRoomChanges(): void {
    this.roomService.currentRoom.subscribe(currentRoom => {
      if (currentRoom) {
        const gameStarted: boolean = currentRoom.gameStarted;
        const roomID: string = currentRoom.roomId;
        if (gameStarted) {
          this.navigateToPlayingRoom(roomID);
        }
      }
    });
  }

  /**
   * Navigates to playing room and sets roomID as query param.
   * @param roomID - roomID to be set as query param.
   * @private
   */
  private navigateToPlayingRoom(roomID: string): void {
    this.router.navigate(['../playing-room'], { relativeTo: this.route, queryParams: { roomID } });
  }
}
