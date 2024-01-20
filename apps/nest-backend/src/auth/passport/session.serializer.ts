import { UsersService } from './../../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { RequestUser, UserTypes } from '@carcasonne-mr/shared-interfaces';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private userService: UsersService) {
    super();
  }

  serializeUser(user: RequestUser, done: (err: Error, user: unknown) => void): void {
    if (!user._id) {
      throw new UnauthorizedException('User id was not specified');
    }

    done(null, user._id);
  }

  deserializeUser(id: string, done: (err: Error | null, payload?: RequestUser) => void): void {
    void this.userService
      .findById(id)
      .catch((err) => done(err))
      .then((user) => {
        console.log('desarializing user...');
        const returnedUser: RequestUser = user
          ? { username: user.username, type: UserTypes.REGISTERED }
          : undefined;
        done(null, returnedUser);
      });
  }
}
