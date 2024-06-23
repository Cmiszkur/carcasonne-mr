import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private readonly muteSoundSSTag = 'mute_sound';

  private _muteSound = signal(sessionStorage.getItem(this.muteSoundSSTag) === 'true');
  public muteSound = this._muteSound.asReadonly();

  constructor() {}

  public toggleMuteSound() {
    this._muteSound.update((v) => !v);
    sessionStorage.setItem(this.muteSoundSSTag, JSON.stringify(this._muteSound()));
  }

  public playPlacedTileSound(): Promise<void> | void {
    if (this.muteSound()) return;

    return new Audio('assets/sounds/placed-tile.mp3').play();
  }

  public playClickTileSound(): Promise<void> | void {
    if (this.muteSound()) return;

    return new Audio('assets/sounds/click-tile.mp3').play();
  }
}
