import { UsersModule } from './../users/users.module';
import { FollowerService } from './services/follower.service';
import { BasicService } from './services/basic.service';
import { GameService } from './services/game.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import RoomService from './services/room.service';
import { Tiles, TilesSchema } from './schemas/tiles.schema';
import { Room, RoomSchema } from './schemas/room.schema';
import { UsersService } from '@nest-backend/src/users/users.service';
import { User, UserSchema } from '@nest-backend/src/users/schemas/user.schema';
import { CheckTilesService } from './services/check-tiles.service';
import { PathService } from './services/path.service';
import { TilesService } from './services/tiles.service';
import { PointCountingService } from './services/point-counting.service';
import { CustomLoggerModule } from '../custom-logger/custom-logger.module';

@Module({
  providers: [
    EventsGateway,
    RoomService,
    UsersService,
    CheckTilesService,
    GameService,
    BasicService,
    PathService,
    TilesService,
    PointCountingService,
    FollowerService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Tiles.name, schema: TilesSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CustomLoggerModule,
    UsersModule,
  ],
  exports: [RoomService],
})
export class EventsModule {}
