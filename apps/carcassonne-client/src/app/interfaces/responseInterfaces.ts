export interface LoginUser {
  username: string;
  password: string;
}

export interface UnauthorizedExceptionGUI {
  message: string;
  statusCode: number;
  error: string;
}
