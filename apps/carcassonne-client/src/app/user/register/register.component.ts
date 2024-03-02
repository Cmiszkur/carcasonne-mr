import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormInit, RegiserFormData } from '@frontend-types';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  registerForm: FormGroup<FormInit<RegiserFormData>>;

  constructor(private authService: AuthService) {
    this.registerForm = new FormGroup<FormInit<RegiserFormData>>({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
    this.listenForConfirmPasswordChanges();
  }

  public onSubmit() {
    const data = this.registerForm.value;
    if (this.registerForm.valid && this.isRegiserFormData(data)) {
      this.authService
        .register({ email: data.email, password: data.password, username: data.username })
        .subscribe(console.log);
    }
  }

  private validateMatchingPasswords(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    const confirmPassword = confirmPasswordControl?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      confirmPasswordControl?.setErrors({ passwordMatch: true });
    } else {
      const errors = confirmPasswordControl?.errors as
        | {
            required?: string;
            confirmPassword?: string;
          }
        | undefined;

      if (errors) {
        const { confirmPassword, ...remainingErrors } = confirmPasswordControl?.errors as {
          required?: string;
          confirmPassword?: string;
        };
        confirmPasswordControl?.setErrors(remainingErrors);
      } else {
        confirmPasswordControl?.setErrors(null);
      }
    }
  }

  private listenForConfirmPasswordChanges(): void {
    this.registerForm
      .get('confirmPassword')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.validateMatchingPasswords());
  }

  private isRegiserFormData(data: unknown): data is RegiserFormData {
    return (
      !!data && typeof data === 'object' && 'username' in data && Object.values(data).every(Boolean)
    );
  }
}
