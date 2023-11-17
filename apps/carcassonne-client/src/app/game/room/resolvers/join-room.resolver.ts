import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RoomService } from '../../services/room.service';
import {
  JoinRoomPayload,
  RoomAbstract,
  SocketAnswer,
} from '@carcasonne-mr/shared-interfaces';

@Injectable({
  providedIn: 'root',
})
export class JoinRoomResolver {
  constructor(private roomService: RoomService) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<SocketAnswer | RoomAbstract> {
    const queryParams: Partial<JoinRoomPayload> = { ...state.root.queryParams };
    return this.roomService.currentRoomValue
      ? of(this.roomService.currentRoomValue)
      : this.roomService.joinRoom(queryParams.color, queryParams.roomID);
  }
}
