import { RoomService } from '../game/services/room.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PrefetchRoomResolverService implements Resolve<any> {
  constructor(private roomService: RoomService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.roomService.getRoom();
  }
}
