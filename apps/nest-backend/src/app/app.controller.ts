import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticatedGuard } from '@nest-backend/src/auth/guards/authenticated.guard';
import { ExtendedRequest } from '@nest-backend/src/interfaces';
import { AuthService } from '@nest-backend/src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser, AccessToken, AppResponse } from '@carcasonne-mr/shared-interfaces';
import { JwtAuthGuard } from '../auth/guards/guest-jwt.guard';
import { UseAnyGuard } from '@nest-backend/core/decorators';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseAnyGuard(AuthenticatedGuard, JwtAuthGuard)
  @Get('/restricted')
  check(@Request() req: ExtendedRequest): AppResponse<RequestUser> {
    console.log('restrcited path is authorized');
    return { message: req.user };
  }

  @UseGuards(AuthGuard('guest'))
  @Post('/login-guest')
  loginGuest(@Request() req: ExtendedRequest): AppResponse<AccessToken> {
    const accessToken = this.authService.loginGuest(req.user);
    return { message: accessToken };
  }

  @Post('/logout')
  async logout(@Request() req: ExtendedRequest): Promise<AppResponse<null>> {
    await req.logout(undefined, (err) => {
      if (err) return new InternalServerErrorException(err);
    });
    return { message: null };
  }
}
