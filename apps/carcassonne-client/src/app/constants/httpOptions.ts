import { HttpHeaders } from '@angular/common/http';

export class Constants {
  public static get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'http://localhost:3000/',
        'Content-Type': 'application/json',
      }),
      withCredentials: true,
    };
  }

  public static get baseUrl(): string {
    return 'http://localhost:3000/api/';
  }
}
