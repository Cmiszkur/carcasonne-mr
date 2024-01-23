import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { GuestJwtStrategy } from './passport/guest-jwt.strategy';
import { SessionSerializer } from './passport/session.serializer';
import { UsersService } from './../users/users.service';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { GuestStrategy } from './passport/guest.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/guest-jwt.guard';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('NX_JWT_SECRET'),
          signOptions: { expiresIn: '4h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService],
  providers: [
    AuthService,
    LocalStrategy,
    GuestJwtStrategy,
    GuestStrategy,
    UsersService,
    SessionSerializer,
    AuthenticatedGuard,
    JwtAuthGuard,
    LocalAuthGuard,
  ],
})
export class AuthModule {}
