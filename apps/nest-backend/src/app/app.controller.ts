import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthenticatedGuard } from '@nest-backend/src/auth/guards/authenticated.guard';
import { AppResponse, ExtendedRequest } from '@nest-backend/src/interfaces';

@Controller()
export class AppController {
  @UseGuards(AuthenticatedGuard)
  @Get('/restricted')
  check(@Request() req: ExtendedRequest): AppResponse {
    console.log('restrcited path is authorized');
    return { message: req.user };
  }
}
