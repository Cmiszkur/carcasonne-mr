import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginResponse } from '@nest-backend/src/interfaces';
import { JwtService } from '@nestjs/jwt';
import { RequestUser, UserTypes, AccessToken } from '@carcasonne-mr/shared-interfaces';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  public async validateUser(username: string, pass: string): Promise<LoginResponse> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      console.log('nie ma takiego użytkownika');
      return {
        error: 'username',
        user: null,
      };
    }

    if (user.emailPendingConfirmation) {
      return { error: 'email_pending_confirmation', user: null };
    }

    const isMatch: boolean = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      return {
        error: null,
        user: { _id: user._id, type: UserTypes.REGISTERED, username: user.username },
      };
    } else {
      console.log('hasła się nie zgadzają');
      return { error: 'password', user: null };
    }
  }

  public loginGuest(user: RequestUser): AccessToken {
    return {
      access_token: this.jwtService.sign(user),
      user: user,
    };
  }
}
