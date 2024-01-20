import { ExtendedSocket, RequestUser } from '@carcasonne-mr/shared-interfaces';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
export const WSAuthMiddleware = (jwtService: JwtService): SocketMiddleware => {
  return async (socket: ExtendedSocket, next) => {
    try {
      if (socket.request.isAuthenticated()) {
        socket.username = socket.request.user.username;
        return next();
      }

      const token: string | undefined = socket.handshake?.auth?.jwt;

      if (!token) {
        return next({
          name: 'Unauthorizaed',
          message: 'JWT token was not provided',
        });
      }

      const jwtPayload = jwtService.verify<RequestUser>(token ?? '');

      if (jwtPayload) {
        socket.username = jwtPayload.username;
        return next();
      }

      return next({
        name: 'Unauthorizaed',
        message: 'Unauthorizaed',
      });
    } catch (error) {
      return next({
        name: 'Unauthorizaed',
        message: 'Unauthorizaed',
      });
    }
  };
};
