import { Controller, Get } from '@nestjs/common';
import RoomService from '@nest-backend/src/events/services/room.service';
import { ShortenedRoom } from '@carcasonne-mr/shared-interfaces';

@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get('/get-rooms')
  async allRooms(): Promise<ShortenedRoom[]> {
    return await this.roomService.getAllRooms();
  }
}
