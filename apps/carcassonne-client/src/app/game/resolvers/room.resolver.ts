import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ShortenedRoom } from '../models/Room';
import { RoomService } from '../services/room.service';

@Injectable({
  providedIn: 'root',
})
export class RoomResolver  {
  constructor(private roomService: RoomService) {}

  resolve(): Observable<ShortenedRoom[] | null> {
    return this.roomService.getRooms();
  }
}
