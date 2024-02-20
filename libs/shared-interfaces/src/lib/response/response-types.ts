import { RequestUser } from '../socket/socket-types';

export interface AccessToken {
  access_token: string;
  user: RequestUser;
}

export interface AppResponse<T> {
  message: T;
}
