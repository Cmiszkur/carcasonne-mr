import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ExtendedRequest } from '@nest-backend/src/interfaces';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: ExtendedRequest = context
      .switchToHttp()
      .getRequest<ExtendedRequest>();
    return request.isAuthenticated();
  }
}
