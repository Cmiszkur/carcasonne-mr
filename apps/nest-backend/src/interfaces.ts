import { User } from './users/schemas/user.schema';
import { Request } from 'express';

export class RegisterResponse {
  message: string;
  error: string;
}

export class LoginResponse {
  error: string | null;
  user: Omit<User, 'password'> | null;
}

export interface ExtendedRequest extends Request {
  user: string;
  isAuthenticated(): boolean;
}

export interface AppResponse {
  message: string;
}
