import { AuthService } from '../auth.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginAuthResponse } from '../../interfaces/responseInterfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  usernameFormControl = new UntypedFormControl('', [Validators.required]);
  passwordFormControl = new UntypedFormControl('', [Validators.required]);
  LoginForm = new UntypedFormGroup({
    username: this.usernameFormControl,
    password: this.passwordFormControl,
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  login() {
    const userInput = this.LoginForm.value;
    this.authService.login(userInput).subscribe((res: LoginAuthResponse) => {
      if (res.error) {
        if (res.message === 'username') {
          this.usernameFormControl.setErrors({ usernameHasError: true });
        }
        if (res.message === 'password') {
          this.passwordFormControl.setErrors({ passwordHasError: true });
        }
      } else {
        this.router.navigate([this.authService.redirectUrl || '/'], {
          relativeTo: this.activatedRoute,
        });
      }
    });
  }
}
