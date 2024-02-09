import { JwtService } from './../../user/services/jwt.service';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  /**
   * Socket io client.
   */
  protected socket: Socket;

  constructor(protected jwtService: JwtService) {
    this.socket = io(`${environment.socketURL}`, {
      withCredentials: true,
      autoConnect: false,
      path: '/socket/',
      auth: { jwt: this.jwtService.getToken() },
      secure: true,
    });

    //TODO: Add better error handling
    this.socket.on('connect_error', (err) => console.error(err));
    this.socket.on('connect_failed', (err) => console.error(err));
    this.socket.on('disconnect', (err) => console.error(err));
  }

  /**
   * Removes specified event listener from socket.
   */
  public removeListener(event: string): void {
    this.socket.off(event);
  }

  /**
   * Removes many events listeners from socket.
   * @param events
   */
  public removeManyListeners(...events: string[]): void {
    events.forEach((event) => this.removeListener(event));
  }

  /**
   * Disconnects from the socket.io backend.
   * @protected
   */
  public disconnect(): void {
    this.socket.disconnect();
  }

  /**
   * Connects before making an action if not connected already.
   * @protected
   */
  protected connect(): void {
    this.socket.connect();
  }

  /**
   * Returns observable that listens on specified event.
   * To unsubscribe keep reference to this observable and kill socket listener after.
   * @param eventName - name of the event
   * @returns
   */
  protected fromEvent<T>(eventName: string): Observable<T> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (response) => {
        if (!subscriber.closed) {
          console.log('Im in a subscriber ', eventName, response);
          subscriber.next(response);
        }
      });
    });
  }

  /**
   * Returns observable once and then kills socket listener.
   * @param eventName - name of the event
   * @returns
   */
  protected fromEventOnce<T>(eventName: string): Observable<T> {
    return this.fromEvent<T>(eventName).pipe(
      take(1),
      tap(() => this.removeListener(eventName))
    );
  }
}
