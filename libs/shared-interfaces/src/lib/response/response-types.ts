import { RequestUser } from '../socket/socket-types';
import { EmailAbstract } from '../email-abstract';
import { SafeUser } from '../user';

export interface AccessToken {
  access_token: string;
  user: RequestUser;
}

export interface AppResponse<T> {
  message: T;
}

export type EmailConfirmationStatus = Omit<EmailAbstract, 'token' | 'user'>;

export type RegistrationResponse = SafeUser &
  EmailConfirmationStatus & { emailConfirmationId: string };
