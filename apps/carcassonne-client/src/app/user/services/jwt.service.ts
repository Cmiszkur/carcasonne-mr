import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor() {}

  // Store the JWT token in session storage
  public setToken(token: string) {
    sessionStorage.setItem('jwtToken', token);
  }

  // Get the JWT token from session storage
  public getToken(): string | null {
    return sessionStorage.getItem('jwtToken');
  }

  // Remove the JWT token from session storage
  public removeToken() {
    sessionStorage.removeItem('jwtToken');
  }
}
