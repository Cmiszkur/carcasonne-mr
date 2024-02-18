import { environment } from '@nest-backend/src/environments/environment.prod';
import { IoAdapter } from '@nestjs/platform-socket.io';
import passport = require('passport');
import { Server, Socket, ServerOptions } from 'socket.io';
import express = require('express');
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { WSAuthMiddleware } from './middleware/ws-auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { createServer } from 'https';
import * as fs from 'fs';

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
    const cors = { origin, credentials: true };
    const path = this.configService.get<string>('NX_SOCKET_PATH');
    options.cors = cors;
    options.path = path;

    const server = environment.production
      ? this.createSecureIOServer(port, options)
      : super.createIOServer(port, options);
    const wrap = (middleware) => (socket: Socket, next) => middleware(socket.request, {}, next);

    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));
    server.use(wrap(cookieParser()));
    server.use(WSAuthMiddleware(this.jwtService));
    return server;
  }

  // create(
  //   port: number,
  //   options?: ServerOptions & { namespace?: string; server?: unknown }
  // ): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown> {
  //   const httpsServer = createServer({
  //     ca: fs.readFileSync('/etc/ssl/server-cert-key/cloudflare.crt'),
  //     key: fs.readFileSync('/etc/ssl/server-cert-key/key.pem'),
  //     cert: fs.readFileSync('/etc/ssl/server-cert-key/cert.pem'),
  //   }).listen(port);

  //   const ioServer = new Server(httpsServer, options);

  //   return super.create(port, environment.production ? { ...options, server: ioServer } : options);
  // }

  createSecureIOServer(port: number, options?: ServerOptions): Server {
    const httpsServer = createServer({
      ca: fs.readFileSync('/etc/ssl/server-cert-key/cloudflare.crt'),
      key: fs.readFileSync('/etc/ssl/server-cert-key/key.pem'),
      cert: fs.readFileSync('/etc/ssl/server-cert-key/cert.pem'),
    }).listen(port);

    return new Server(httpsServer, options);
  }
}
