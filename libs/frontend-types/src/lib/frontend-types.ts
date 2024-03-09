import { FormControl } from '@angular/forms';
import { RoomError } from '@carcassonne-client/src/app/game/models/socket';

export type FormInit<T extends object> = {
  [P in keyof T]: FormControl<T[P] | null>;
};

export interface LoginForm {
  username: string | null;
  password: string | null;
}

export type GuestLoginForm = Pick<LoginForm, 'username'>;

export interface RegiserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SnackBarData {
  title: string;
  text?: string;
}
