import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.sass'],
})
export class BaseComponent implements OnDestroy {
  private readonly destroyed$: Subject<void>;

  constructor() {
    this.destroyed$ = new Subject<void>();
  }

  public get destroyed(): Observable<void> {
    return this.destroyed$.asObservable();
  }

  public ngOnDestroy() {
    this.destroyed$.next();
  }
}
