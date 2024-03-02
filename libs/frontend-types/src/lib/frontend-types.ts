import { FormControl } from '@angular/forms';

export type FormInit<T extends object> = {
  [P in keyof T]: FormControl<T[P]>;
};

export interface LoginForm {
  username: string | null;
  password: string | null;
}

export type GuestLoginForm = Pick<LoginForm, 'username'>;

export interface RegiserFormData {
  username: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
}
