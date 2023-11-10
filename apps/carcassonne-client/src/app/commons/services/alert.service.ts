import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomError } from 'src/app/game/models/socket';
import { AlertComponent } from '../alert/alert.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private _snackBar: MatSnackBar) {}

  openNewAlert(error: RoomError, errorMessage?: string) {
    this._snackBar.openFromComponent(AlertComponent, {
      data: { error, errorMessage },
      verticalPosition: 'top',
      duration: 7000,
    });
  }
}
