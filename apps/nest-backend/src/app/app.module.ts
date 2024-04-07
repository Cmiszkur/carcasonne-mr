import { CoreModule } from './../core/core.module';
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
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${environment.production ? 'production' : 'apps/nest-backend/development'}.env`,
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.NX_MONGO_URI || ''),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]), //Rate limiting can be set via RateLimiter decorator
    AuthModule,
    UsersModule,
    EventsModule,
    RoomModule,
    CoreModule,
  ],
  controllers: [AppController, RoomController],
  providers: [AppService],
})
export class AppModule {}
