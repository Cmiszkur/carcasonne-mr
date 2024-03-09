import { User } from '@nest-backend/src/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type EmailConfirmationDocument = EmailConfirmation & Document;

@Schema()
export class EmailConfirmation {
  @Prop()
  token: string;

  @Prop()
  issuedAt: Date;

  @Prop()
  expiresAfter: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  constructor(partial: Partial<EmailConfirmation>) {
    Object.assign(this, partial);
  }
}

export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
