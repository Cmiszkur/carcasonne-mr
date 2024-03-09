import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmailConfirmationStatus, SafeUser } from '@carcasonne-mr/shared-interfaces';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Constants } from '@carcassonne-client/src/app/constants/httpOptions';
import { AlertService } from '@carcassonne-client/src/app/commons/services/alert.service';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private confirmEmailUrl: string = Constants.baseUrl + 'users/confirm-email';
  private emailConfirmationStatusUrl: string = Constants.baseUrl + 'mail/confirmation-status';
  private resendEmailUrl: string = Constants.baseUrl + 'mail/resend-email';

  constructor(private http: HttpClient, private alert: AlertService) {}

  public confirmEmail(token: string): Observable<SafeUser | null> {
    return this.http
      .get<SafeUser>(`${this.confirmEmailUrl}/${token}`, Constants.httpOptions)
      .pipe(catchError((err) => this.handleError(err)));
  }

  public emailConfirmationStatus(id: string): Observable<EmailConfirmationStatus | null> {
    return this.http
      .get<EmailConfirmationStatus>(
        `${this.emailConfirmationStatusUrl}/${id}`,
        Constants.httpOptions
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  public resendEmail(id: string): Observable<EmailConfirmationStatus | null> {
    return this.http
      .post<EmailConfirmationStatus>(`${this.resendEmailUrl}/${id}`, {}, Constants.httpOptions)
      .pipe(catchError((err) => this.handleError(err)));
  }

  private handleError(err: HttpErrorResponse): Observable<null> {
    this.alert.openNewAlert(err.error.message);
    return of(null);
  }
}
