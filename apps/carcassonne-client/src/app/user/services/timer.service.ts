import { Injectable } from '@angular/core';
import { Observable, takeWhile, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  startTimer(seconds: number): Observable<number> {
    return timer(new Date(), 1000).pipe(
      //takeUntil(timer(seconds * 1000 + 1000)) // Add 1000 ms to make sure it completes after the specified seconds
      takeWhile((count) => count <= seconds),
      map((count) => seconds - count)
    );
  }
}
