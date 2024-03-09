import { EmailConfirmation, EmailConfirmationDocument } from './schemas/email-confirmation.schema';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { EmailConfirmationStatus } from '@carcasonne-mr/shared-interfaces';
import { addToDate } from '@shared-functions';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    @InjectModel(EmailConfirmation.name) private emailConfirmationModel: Model<EmailConfirmation>
  ) {}

  public async sendUserConfirmation(user: User & { _id: Types.ObjectId }, token: string) {
    console.log(user);

    const confirmationLink = this.getConfirmationLink(token);

    await this.sendMail(confirmationLink, user.username, user.email);
    return await new this.emailConfirmationModel({
      token,
      issuedAt: new Date(),
      expiresAfter: addToDate(new Date(), 'hours', 24),
      user: user._id,
    }).save();
  }

  public async deleteConfirmation(token: string) {
    return this.emailConfirmationModel.deleteOne({ token });
  }

  public async resendMail(id: string): Promise<EmailConfirmationStatus> {
    const confirmation = await this.findConfirmationById(id);
    if (!this.areDatesDifferenceGreaterThanFiveMinutes(confirmation.issuedAt, new Date())) {
      return null;
    }
    const user = confirmation.user;
    await this.sendMail(this.getConfirmationLink(confirmation.token), user.username, user.email);
    confirmation.issuedAt = new Date();
    await confirmation.save();
    return { expiresAfter: confirmation.expiresAfter, issuedAt: confirmation.issuedAt };
  }

  private async sendMail(confirmationLink: string, username: string, email: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Realm Architect!',
      template: './confirmation',
      context: {
        username,
        confirmationLink,
      },
    });
  }

  public async confirmationStatus(id: string): Promise<EmailConfirmationStatus> {
    const test = await this.findConfirmationById(id);
    console.log(test);
    const confirmation = test.toObject();
    return { expiresAfter: confirmation.expiresAfter, issuedAt: confirmation.issuedAt };
  }

  public async findConfirmation(token?: string) {
    return this.emailConfirmationModel.findOne({ token }).populate('user');
  }

  public async findConfirmationById(id: string) {
    return this.emailConfirmationModel.findById(id).populate('user');
  }

  private areDatesDifferenceGreaterThanFiveMinutes(date1: Date, date2: Date) {
    // Calculate the difference in milliseconds
    const timeDifference = Math.abs(date1.valueOf() - date2.valueOf());

    // Check if the difference is more than five minutes (300,000 milliseconds)
    return timeDifference > 300000; // 5 minutes in milliseconds
  }

  private getConfirmationLink(token: string) {
    return `${this.configService.get('NX_CLIENT_CORS_ORIGIN')}/confirm-email/${token}`;
  }
}
