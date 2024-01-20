import { RequestUser, UserTypes } from '@carcasonne-mr/shared-interfaces';
import { ExtendedRequest } from '@nest-backend/src/interfaces';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { randomBytes } from 'crypto';
import { Strategy } from 'passport-custom';

@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  async validate(req: ExtendedRequest): Promise<RequestUser> {
    const username = req.body['username'] || 'Guest';
    return { username: `${username}_${randomBytes(8).toString('hex')}`, type: UserTypes.GUEST };
  }
}
