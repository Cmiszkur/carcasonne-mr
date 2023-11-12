import { UsersService } from './users.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { LocalAuthGuard } from '@nest-backend/src/auth/guards/local-auth.guard';
import { AppResponse, ExtendedRequest } from '@nest-backend/src/interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req: ExtendedRequest): AppResponse {
    return { message: req.user };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/register')
  register(@Body() newUser: User): Promise<User> {
    return this.usersService.create(newUser);
  }
}
