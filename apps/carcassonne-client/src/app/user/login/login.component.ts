import { AuthService } from '../auth.service';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginAuthResponse } from '../../interfaces/responseInterfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent {
  usernameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);
  LoginForm = new FormGroup({
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
