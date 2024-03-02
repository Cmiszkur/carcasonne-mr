import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertComponent } from '../alert/alert.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private _snackBar: MatSnackBar) {}

  openNewAlert(error: string, errorMessage?: string) {
    this._snackBar.openFromComponent(AlertComponent, {
      data: { error, errorMessage },
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
