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
    return 'http://localhost:3000/';
  }

  /**
   * Deep copies object in order to prevent backwards mutability(made up name).
   * @param object
   */
  public static copy<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }
}
