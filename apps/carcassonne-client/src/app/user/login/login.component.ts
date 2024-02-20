import { AuthService } from '../services/auth.service';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LoginUser,
  UnauthorizedExceptionGUI,
} from '@carcassonne-client/src/app/interfaces/responseInterfaces';
import { LoginOptions } from '@carcassonne-client/src/app/interfaces/login-options';
import { AppResponse, RequestUser } from '@carcasonne-mr/shared-interfaces';

export interface LoginForm {
  username: string | null;
  password: string | null;
}

export type GuestLoginForm = Pick<LoginForm, 'username'>;

export type FormInit<T extends object> = {
  [P in keyof T]: FormControl<T[P]>;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  public usernameFormControl = new FormControl<string>('', [Validators.required]);
  public passwordFormControl = new FormControl<string>('', [Validators.required]);
  public loginForm = new FormGroup<FormInit<LoginForm>>({
    username: this.usernameFormControl,
    password: this.passwordFormControl,
  });
  public guestLoginForm = new FormGroup<FormInit<GuestLoginForm>>({
    username: this.usernameFormControl,
  });
  public loginOptions = [
    { value: LoginOptions.REGISTERED, text: 'Registered' },
    { value: LoginOptions.GUEST, text: 'Guest' },
  ];
  public selectedOption = this.loginOptions[0].value;
  public loginOptionsEnum: typeof LoginOptions = LoginOptions;
  public registeredUser = signal(true);

  constructor(private authService: AuthService, private router: Router) {}

  public login(): void {
    const userInput = this.loginForm.value;

    if (!this.registeredUser()) {
      return this.guestLogin();
    }

    if (!this.userInputIsValid(userInput)) {
      return;
    }

    this.authService
      .login(userInput)
      .subscribe((res: AppResponse<RequestUser> | UnauthorizedExceptionGUI) => {
        if ('error' in res) {
          if (res.message === 'username') {
            this.usernameFormControl.setErrors({ usernameHasError: true });
          }
          if (res.message === 'password') {
            this.passwordFormControl.setErrors({ passwordHasError: true });
          }
        } else {
          this.navigateFromLoginPage();
        }
      });
  }

  public guestLogin(): void {
    const username = this.guestLoginForm.value.username;

    if (!username) {
      //exception handler
      return;
    }

    this.authService.guestLogin(username).subscribe(() => this.navigateFromLoginPage());
  }

  public changeLoginOption(loginOption: LoginOptions): void {
    this.selectedOption = loginOption;
    this.registeredUser.set(loginOption === LoginOptions.REGISTERED);
  }

  private userInputIsValid(userInput: Partial<LoginForm>): userInput is LoginUser {
    return !!userInput.password && !!userInput.username;
  }

  private navigateFromLoginPage(): void {
    this.router.navigateByUrl(this.authService.redirectUrl || '/');
  }
}
