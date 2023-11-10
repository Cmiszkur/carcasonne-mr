import { Observable } from 'rxjs/internal/Observable';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from './components/base/base.component';

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    dieWith(comp: BaseComponent): Observable<T>;
  }
}

/**
 * Kills observable when ``BaseComponent`` is destroyed.
 * Must extended current component with ``BaseComponent`` before usage.
 * @param comp - currently used component.
 */
Observable.prototype.dieWith = function <T>(comp: BaseComponent): Observable<T> {
  return this.pipe(takeUntil(comp.destroyed));
};
