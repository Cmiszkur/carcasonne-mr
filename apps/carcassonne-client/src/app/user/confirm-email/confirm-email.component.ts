import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { SafeUser } from '@carcasonne-mr/shared-interfaces';
import { EmailService } from '@carcassonne-client/src/app/user/services/email.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmEmailComponent {
  public userConfirmation: SafeUser | null = null;
  public message: string = 'Something went wrong! Try again later or check provided url';
  public showSpinner = signal(true);
  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService
  ) {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const token = params.get('token');
          if (!token) {
            return of(null);
          }
          return this.emailService.confirmEmail(token);
        })
      )
      .subscribe((user) => {
        if (user) {
          setTimeout(() => this.router.navigateByUrl('/login'), 10000);
          this.message =
            'Email confirmed successfully! You will be redirected to login page shortly';
          this.userConfirmation = user;
        }
        this.showSpinner.set(false);
      });
  }
}
