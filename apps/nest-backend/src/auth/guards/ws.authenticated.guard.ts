import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  ExtendedIncomingMessage,
  ExtendedSocket,
} from '@carcasonne-mr/shared-interfaces';

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<ExtendedSocket>();
    const request: ExtendedIncomingMessage = client.request;
    return request.isAuthenticated();
  }
}
