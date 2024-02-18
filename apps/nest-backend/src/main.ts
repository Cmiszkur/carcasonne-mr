import { environment } from '@nest-backend/src/environments/environment';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import MongoStore = require('connect-mongo');
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import passport = require('passport');
import { AppModule } from './app/app.module';
import { SessionAdapter } from './events/events.adapter';
import { CustomLoggerService } from './custom-logger/custom-logger.service';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import { customOrigin } from '@nest-backend/core/functions/customOrigin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    httpsOptions: environment.production
      ? {
          ca: fs.readFileSync('/etc/ssl/server-cert-key/cloudflare.crt'),
          key: fs.readFileSync('/etc/ssl/server-cert-key/key.pem'),
          cert: fs.readFileSync('/etc/ssl/server-cert-key/cert.pem'),
        }
      : undefined,
  });
  const configService = app.get(ConfigService);
  const jwtService = app.get(JwtService);
  const sessionSecret = configService.get('NX_SESSION_SECRET');
  const MongoUri = configService.get('NX_MONGO_URI');
  const sessionMiddleware = session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MongoUri }),
    cookie: {
      maxAge: 60 * 1000 * 60 * 24 * 14,
    },
  });
  app.enableCors({
    origin: customOrigin,
    credentials: true,
  });
  app.setGlobalPrefix('api', { exclude: ['socket'] });
  app.useLogger(app.get(CustomLoggerService));
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  app.useWebSocketAdapter(new SessionAdapter(sessionMiddleware, configService, jwtService));
  await app.listen(configService.get('NX_NEST_PORT'));
}
bootstrap();
