import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from './services/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RequestUser } from '@carcasonne-mr/shared-interfaces';
import { of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<RequestUser | UrlTree> {
    return this.checkAuth(state.url);
  }

  checkAuth(url: string): Observable<RequestUser | UrlTree> {
    this.authService.redirectUrl = url;
    return this.authService
      .auth()
      .pipe(switchMap((res) => of(res ? res : this.router.parseUrl('/login'))));
  }
}
