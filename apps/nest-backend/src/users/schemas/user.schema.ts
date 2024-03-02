import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';
import { UserAbstract } from '@carcasonne-mr/shared-interfaces';

export type UserDocument = User & Document;

@Schema()
export class User implements UserAbstract {
  @Prop()
  email: string;

  @Prop()
  username: string;

  @Exclude()
  @Prop()
  password: string;

  @Prop()
  lastCreatedRoom?: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
