import { EmailConfirmation, EmailConfirmationSchema } from './schemas/email-confirmation.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EmailConfirmation.name, schema: EmailConfirmationSchema }]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'kaela41@ethereal.email\n',
          pass: 'spqGMRySc7Qxj3tk1f',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@realm-architect.com>',
      },
      template: {
        dir: join(__dirname, 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [
    MongooseModule.forFeature([{ name: EmailConfirmation.name, schema: EmailConfirmationSchema }]),
    MailService,
  ],
  controllers: [MailController],
})
export class MailModule {}
