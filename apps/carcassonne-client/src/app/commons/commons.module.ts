import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseComponent } from './components/base/base.component';
import { MatMenuModule } from '@angular/material/menu';
import { CountdownPipe } from '@carcassonne-client/src/app/commons/pipes/countdown.pipe';
import { TileBorderColorPipe } from '@carcassonne-client/src/app/commons/pipes/tile-border-color.pipe';

const allModules = [
  MatButtonModule,
  MatIconModule,
  DragDropModule,
  MatTableModule,
  MatCheckboxModule,
  MatDialogModule,
  MatToolbarModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatRadioModule,
  MatSnackBarModule,
  MatMenuModule,
];

const pipes = [CountdownPipe, TileBorderColorPipe];

@NgModule({
  declarations: [BaseComponent],
  imports: [...allModules, ...pipes],
  exports: [...allModules, BaseComponent, ...pipes],
})
export class CommonsModule {}
