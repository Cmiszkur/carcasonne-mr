import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormInit, RegiserFormData } from '@frontend-types';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  registerForm: FormGroup<FormInit<RegiserFormData>>;

  constructor() {
    this.registerForm = new FormGroup<FormInit<RegiserFormData>>({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
    this.registerForm
      .get('confirmPassword')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => this.validateMatchingPasswords());
  }
  validateMatchingPasswords(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    const confirmPassword = confirmPasswordControl?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      confirmPasswordControl?.setErrors({ passwordMatch: true });
    } else {
      const { confirmPassword, ...remainingErrors } = confirmPasswordControl?.errors as {
        required?: string;
        confirmPassword?: string;
      };
      confirmPasswordControl?.setErrors(remainingErrors);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      //send to api
    }
  }
}
