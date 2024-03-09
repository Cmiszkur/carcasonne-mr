import { Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { MailService } from '@nest-backend/src/mail/mail.service';
import { EmailConfirmationStatus } from '@carcasonne-mr/shared-interfaces';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('confirmation-status/:id')
  confirmationStatus(@Param('id') id: string | undefined): Promise<EmailConfirmationStatus> {
    if (!id) {
      throw new HttpException('ID is required', HttpStatus.BAD_REQUEST);
    }

    return this.mailService.confirmationStatus(id);
  }

  @Post('resend-email/:id')
  resendEmail(@Param('id') id: string | undefined) {
    if (!id) {
      throw new HttpException('ID is required', HttpStatus.BAD_REQUEST);
    }

    return this.mailService.resendMail(id);
  }
}
