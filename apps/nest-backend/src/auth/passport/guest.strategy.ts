import { RequestUser, UserTypes } from '@carcasonne-mr/shared-interfaces';
import { ExtendedRequest } from '@nest-backend/src/interfaces';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { Strategy } from 'passport-custom';

@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  async validate(req: ExtendedRequest): Promise<RequestUser> {
    const username = req.body['username'];

    if (username && typeof username === 'string' && username.length > 15) {
      throw new HttpException(
        "Username can't be longer than 15 characters",
        HttpStatus.BAD_REQUEST
      );
    }

    return {
      username: username || 'Guest',
      type: UserTypes.GUEST,
      randomizationId: randomUUID(),
    };
  }
}
