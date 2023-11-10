import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RoomService } from '../../services/room.service';
import { JoinRoomParams, SocketAnswer } from '../../models/socket';
import { Room } from '../../models/Room';

@Injectable({
  providedIn: 'root',
})
export class JoinRoomResolver implements Resolve<SocketAnswer | Room> {
  constructor(private roomService: RoomService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SocketAnswer | Room> {
    const queryParams: JoinRoomParams = { ...state.root.queryParams };
    return this.roomService.currentRoomValue
      ? of(this.roomService.currentRoomValue)
      : this.roomService.joinRoom(queryParams.color, queryParams.roomID);
  }
}
