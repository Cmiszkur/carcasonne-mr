import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Coordinates } from '@carcasonne-mr/shared-interfaces';

@Injectable({
  providedIn: 'root',
})
export class MovesChatService {
  private timeout: NodeJS.Timeout | null = null;
  private _highlightSelectedBoardMoveCords: WritableSignal<Coordinates | null> =
    signal<Coordinates | null>(null);
  public highlightSelectedBoardMoveCords: Signal<Coordinates | null> =
    this._highlightSelectedBoardMoveCords.asReadonly();

  constructor() {}

  public highlightSelectedBoardMove(coords: Coordinates | null): void {
    this._highlightSelectedBoardMoveCords.set(coords);

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => this._highlightSelectedBoardMoveCords.set(null), 5000);
  }
}
