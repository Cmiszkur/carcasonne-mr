import { Constants } from '../../constants/httpOptions';
import {
  AuthResponse,
  LoginAuthResponse,
  LoginUser,
  UserResponse,
} from '../../interfaces/responseInterfaces';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AccessToken, AppResponse } from '@carcasonne-mr/shared-interfaces';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * User returned from authentication process.
   * @private
   */
  private user$: BehaviorSubject<UserResponse | null>;
  /**
   * Url used to save url from where application redirected to login page.
   * It's later used to redirect back.
   */
  public redirectUrl: string | null;
  private authUrl: string = Constants.baseUrl + 'restricted';
  private loginUrl: string = Constants.baseUrl + 'users/login';
  private guestLoginUrl: string = Constants.baseUrl + 'login-guest';

  constructor(private http: HttpClient, private jwtService: JwtService) {
    this.redirectUrl = null;
    this.user$ = new BehaviorSubject<UserResponse | null>(null);
  }

  public async auth(): Promise<boolean> {
    return this.http
      .get<AuthResponse>(this.authUrl, Constants.httpOptions)
      .toPromise()
      .then(
        (response) => {
          this.saveUser(response?.message || null);
          return true;
        },
        () => {
          return false;
        }
      );
  }

  public login(loginUser: LoginUser): Observable<LoginAuthResponse> {
    return this.http
      .post<LoginAuthResponse>(this.loginUrl, loginUser, Constants.httpOptions)
      .pipe(catchError(this.handleError<LoginAuthResponse>()));
  }

  public guestLogin(username: string): Observable<AppResponse<AccessToken>> {
    return this.http
      .post<AppResponse<AccessToken>>(this.guestLoginUrl, { username }, Constants.httpOptions)
      .pipe(
        catchError(this.handleError<AppResponse<AccessToken>>()),
        tap((answer) => this.jwtService.setToken(answer.message.access_token))
      );
  }

  public get user(): UserResponse | null {
    return this.user$.value;
  }

  private saveUser(user: UserResponse | null) {
    this.user$.next(user);
  }

  private handleError<T>() {
    return (error: HttpErrorResponse): Observable<T> => {
      console.log(error);
      const errorMessage = error.error;
      return of(errorMessage as T);
    };
  }
}
