import { IoAdapter } from '@nestjs/platform-socket.io';
import passport = require('passport');
import { Server, Socket, ServerOptions } from 'socket.io';
import express = require('express');
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { WSAuthMiddleware } from './middleware/ws-auth.middleware';
import { JwtService } from '@nestjs/jwt';

export class SessionAdapter extends IoAdapter {
  private session: express.RequestHandler;

  constructor(
    session: express.RequestHandler,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {
    super(session);
    this.session = session;
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const origin = this.configService.get<string>('NX_CLIENT_CORS_ORIGIN');
    const path = this.configService.get<string>('NX_SOCKET_PATH');
    options.cors = { origin, credentials: true };
    options.path = path;
    const server: Server = super.createIOServer(port, options);

    const wrap = (middleware) => (socket: Socket, next) => middleware(socket.request, {}, next);

    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));
    server.use(wrap(cookieParser()));
    server.use(WSAuthMiddleware(this.jwtService));
    return server;
  }
}
