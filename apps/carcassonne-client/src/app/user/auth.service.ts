import { Constants } from '../constants/httpOptions';
import {
  AuthResponse,
  LoginAuthResponse,
  loginUser,
  UserResponse,
} from '../interfaces/responseInterfaces';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  private authUrl: string;
  private loginUrl: string;

  constructor(private http: HttpClient) {
    this.redirectUrl = null;
    this.user$ = new BehaviorSubject<UserResponse | null>(null);
    this.authUrl = Constants.baseUrl + 'restricted';
    this.loginUrl = Constants.baseUrl + 'users/login';
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
        (e) => {
          return false;
        }
      );
  }

  public login(loginUser: loginUser): Observable<LoginAuthResponse> {
    return this.http
      .post<LoginAuthResponse>(this.loginUrl, loginUser, Constants.httpOptions)
      .pipe(catchError(this.handleError<LoginAuthResponse>()));
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
