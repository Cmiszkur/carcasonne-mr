import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { RoomModule } from '../room/room.module';
import { RoomController } from '../room/room.controller';
import { environment } from '../environments/environment';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: environment.production ? `.env.prod` : `.env.dev`,
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.NX_MONGO_URI || ''),
    EventsModule,
    RoomModule,
  ],
  controllers: [AppController, RoomController],
  providers: [AppService],
})
export class AppModule {}
