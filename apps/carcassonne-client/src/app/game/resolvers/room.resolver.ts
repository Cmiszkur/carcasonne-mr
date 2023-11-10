import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ShortenedRoom } from '../models/Room';
import { RoomService } from '../services/room.service';

@Injectable({
  providedIn: 'root',
})
export class RoomResolver implements Resolve<ShortenedRoom[] | null> {
  constructor(private roomService: RoomService) {}

  resolve(): Observable<ShortenedRoom[] | null> {
    return this.roomService.getRooms();
  }
}
