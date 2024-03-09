import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertComponent } from '../alert/alert.component';
import { SnackBarData } from '@frontend-types';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private _snackBar: MatSnackBar) {}

  public openNewAlert(error: string, errorMessage?: string) {
    this._snackBar.openFromComponent<AlertComponent, SnackBarData>(AlertComponent, {
      data: { title: error, text: errorMessage },
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  public openNewNotification(title: string, additionalText?: string) {
    this._snackBar.openFromComponent<AlertComponent, SnackBarData>(AlertComponent, {
      data: { title, text: additionalText },
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
