import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { TimerService } from '@carcassonne-client/src/app/user/services/timer.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmailService } from '@carcassonne-client/src/app/user/services/email.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@carcassonne-client/src/app/commons/services/alert.service';

@Component({
  selector: 'app-registration-success',
  templateUrl: './registration-success.component.html',
  styleUrl: './registration-success.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationSuccessComponent {
  public successMessage: WritableSignal<string | null> = signal(null);
  public countdown = signal(0);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private timerService: TimerService,
    private emailService: EmailService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) {
    this.checkEmailConfirmationStatus();
  }

  private get emailConfirmationId() {
    return decodeURI(this.route.snapshot.params['id']);
  }

  public resendEmail(): void {
    this.emailService
      .resendEmail(this.emailConfirmationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmationStatus) => {
        if (confirmationStatus) {
          this.alertService.openNewNotification('Email sent successfully!');
          this.initializeCountdown(confirmationStatus.issuedAt);
          this.startCountdownTimer();
        }
      });
  }

  private checkEmailConfirmationStatus() {
    const emailConfirmationId = this.emailConfirmationId;

    if (!emailConfirmationId) {
      this.router.navigate(['/']);
    }

    this.emailService
      .emailConfirmationStatus(emailConfirmationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmationStatus) => {
        if (confirmationStatus) {
          this.successMessage.set('Successfully registered');
          this.initializeCountdown(confirmationStatus.issuedAt);
          this.startCountdownTimer();
        }
      });
  }

  private initializeCountdown(issuedAt: Date): void {
    const secondsDifference = 300 - this.getSecondsDifference(new Date(), new Date(issuedAt));
    this.countdown.set(secondsDifference > 0 ? secondsDifference : 0);
  }

  private startCountdownTimer(): void {
    this.timerService
      .startTimer(this.countdown())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((time) => {
        this.countdown.set(time);
      });
  }

  private getSecondsDifference(date1: Date, date2: Date): number {
    const differenceInMillis = Math.abs(date1.getTime() - date2.getTime());
    const differenceInSeconds = differenceInMillis / 1000;
    return Math.floor(differenceInSeconds);
  }
}
