import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    return this.checkAuth(state.url);
  }

  async checkAuth(url: string): Promise<boolean | UrlTree> {
    this.authService.redirectUrl = url;
    const response = await this.authService.auth();
    if (response) {
      console.log('autoryzacja się powiodła');
      return true;
    }

    console.log('autoryzacja się nie powiodła');
    return this.router.parseUrl('/login');
  }
}
