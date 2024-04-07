import { UsersService } from './users.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { LocalAuthGuard } from '@nest-backend/src/auth/guards/local-auth.guard';
import { ExtendedRequest } from '@nest-backend/src/interfaces';
import {
  RequestUser,
  AppResponse,
  SafeUser,
  RegistrationResponse,
} from '@carcasonne-mr/shared-interfaces';
import { RateLimiter } from '@nest-backend/core/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req: ExtendedRequest): AppResponse<RequestUser> {
    return { message: req.user };
  }

  @RateLimiter(90000, 10)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/register')
  register(@Body() newUser: User): Promise<RegistrationResponse> {
    return this.usersService.create(newUser);
  }

  @Get('/confirm-email/:token')
  confirmEmail(@Param('token') token: string | undefined): Promise<SafeUser> {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }

    return this.usersService.confirmUsersEmail(token);
  }
}
