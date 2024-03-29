import { environment } from './../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

export class Constants {
  public static get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': `${environment.apiURL}/`,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('jwtToken')}`,
      }),
      withCredentials: true,
    };
  }

  public static get baseUrl(): string {
    return `${environment.apiURL}/api/`;
  }
}
