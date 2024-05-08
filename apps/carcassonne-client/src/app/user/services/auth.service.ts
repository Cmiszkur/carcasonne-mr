import { Constants } from '../../constants/httpOptions';
import { LoginUser, UnauthorizedExceptionGUI } from '../../interfaces/responseInterfaces';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, of, Observable, EMPTY } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  AccessToken,
  AppResponse,
  RegistrationResponse,
  RequestUser,
  UserAbstract,
  UserTypes,
} from '@carcasonne-mr/shared-interfaces';
import { JwtService } from './jwt.service';
import { AlertService } from '../../commons/services/alert.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * User returned from authentication process.
   * @private
   */
  private user$: BehaviorSubject<RequestUser | null>;
  /**
   * Url used to save url from where application redirected to login page.
   * It's later used to redirect back.
   */
  public redirectUrl: string | null;
  /**
   * Is used to confirm that query params used in redirection after logging when
   * unauthorized user is trying to create room, are legit.
   */
  public redirectId?: string;
  private authUrl: string = Constants.baseUrl + 'restricted';
  private loginUrl: string = Constants.baseUrl + 'users/login';
  private logoutUrl: string = Constants.baseUrl + 'logout';
  private guestLoginUrl: string = Constants.baseUrl + 'login-guest';
  private registerUrl = Constants.baseUrl + 'users/register';

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private alert: AlertService
  ) {
    this.redirectUrl = null;
    this.user$ = new BehaviorSubject<RequestUser | null>(null);
  }

  public auth(): Observable<RequestUser | null> {
    return this.user
      ? of(this.user)
      : this.http.get<AppResponse<RequestUser>>(this.authUrl, Constants.httpOptions).pipe(
          catchError(() => {
            this.jwtService.removeToken();
            return of(null);
          }),
          map((res) => res?.message || null),
          tap((response) => this.saveUser(response))
        );
  }

  public login(
    loginUser: LoginUser
  ): Observable<AppResponse<RequestUser> | UnauthorizedExceptionGUI> {
    return this.http
      .post<AppResponse<RequestUser>>(this.loginUrl, loginUser, Constants.httpOptions)
      .pipe(
        catchError(this.handleError<UnauthorizedExceptionGUI>()),
        tap((res) => {
          if (this.isUser(res.message)) this.saveUser(res.message);
        })
      );
  }

  public logout(): Observable<null> {
    if (this.user?.type === UserTypes.GUEST) {
      this.jwtService.removeToken();
      this.saveUser(null);
      return of(null);
    } else {
      return this.logoutRegistered();
    }
  }

  public logoutRegistered(): Observable<null> {
    return this.http.post<AppResponse<null>>(this.logoutUrl, undefined, Constants.httpOptions).pipe(
      catchError(this.handleError<AppResponse<null>>()),
      map((res) => res.message),
      tap(() => this.saveUser(null))
    );
  }

  public guestLogin(username: string): Observable<AppResponse<AccessToken>> {
    return this.http
      .post<AppResponse<AccessToken>>(this.guestLoginUrl, { username }, Constants.httpOptions)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.alert.openNewAlert(err.error.message);
          return EMPTY;
        }),
        tap((answer) => {
          this.jwtService.setToken(answer.message.access_token);
          this.saveUser(answer.message.user);
        })
      );
  }

  public register(user: UserAbstract): Observable<RegistrationResponse | null> {
    return this.http.post<RegistrationResponse>(this.registerUrl, user).pipe(
      catchError((err: HttpErrorResponse) => {
        this.alert.openNewAlert(err.error.message);
        return of(null);
      })
    );
  }

  public get user(): RequestUser | null {
    return this.user$.value;
  }

  public get userObservable(): Observable<RequestUser | null> {
    return this.user$.asObservable();
  }

  private saveUser(user: RequestUser | null) {
    this.user$.next(user);
  }

  private handleError<T>() {
    return (error: HttpErrorResponse): Observable<T> => {
      const errorMessage = error.error;
      return of(errorMessage as T);
    };
  }

  private isUser(item: string | RequestUser): item is RequestUser {
    return !(typeof item === 'string');
  }
}
