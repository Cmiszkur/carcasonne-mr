import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { RoomService } from '../services/room.service';
import { ShortenedRoom } from '@carcasonne-mr/shared-interfaces';

@Injectable({
  providedIn: 'root',
})
export class RoomResolver {
  constructor(private roomService: RoomService) {}

  resolve(): Observable<ShortenedRoom[] | null> {
    return this.roomService.getRooms();
  }
}
