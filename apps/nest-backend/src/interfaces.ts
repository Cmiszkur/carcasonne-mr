import { RequestUser } from '@carcasonne-mr/shared-interfaces';
import { User } from './users/schemas/user.schema';
import { Request } from 'express';

export class RegisterResponse {
  message: string;
  error: string;
}

export class LoginResponse {
  error: string | null;
  user: RequestUser | null;
}

export type LeanUser = User & { _id: string };

export interface ExtendedRequest extends Request {
  user: RequestUser;
  isAuthenticated(): boolean;
}

export interface AppResponse<T> {
  message: T;
}
