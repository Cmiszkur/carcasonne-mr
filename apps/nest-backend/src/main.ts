import { environment } from './environments/environment.prod';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import MongoStore = require('connect-mongo');
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import passport = require('passport');
import { AppModule } from './app/app.module';
import { SessionAdapter } from './events/events.adapter';
import { CustomLoggerService } from './custom-logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
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
    origin: configService.get('NX_CLIENT_CORS_ORIGIN'),
    credentials: true,
  });
  app.setGlobalPrefix('api', { exclude: ['socket'] });
  app.useLogger(app.get(CustomLoggerService));
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  app.useWebSocketAdapter(new SessionAdapter(sessionMiddleware, configService));
  await app.listen(3000);
}
bootstrap();
