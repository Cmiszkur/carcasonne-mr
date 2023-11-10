export interface AuthResponse {
  statusCode: number;
  message: UserResponse;
}

export interface loginUser {
  username: string;
  password: string;
}

export interface UserResponse {
  username: string;
  name: string;
  email: string;
}

export interface LoginAuthResponse {
  /**
   * If unauthorized exception message contains "password" or "username"
   * which indicates which field is filled incorrectly.
   * On success message contains user data.
   */
  message: string | UserResponse;
  error?: string;
}
