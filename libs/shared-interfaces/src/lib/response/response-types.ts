export interface AccessToken {
  access_token: string;
  username: string;
}

export interface AppResponse<T> {
  message: T;
}
