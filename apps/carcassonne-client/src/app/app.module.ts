import { UserModule } from './user/user.module';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { CommonsModule } from './commons/commons.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomErrorHandler } from './commons/customErrorHandler';
import { AlertComponent } from './commons/alert/alert.component';

@NgModule({
  declarations: [AppComponent, ToolbarComponent, AlertComponent],
  imports: [BrowserModule, AppRoutingModule, UserModule, CommonsModule, BrowserAnimationsModule],
  providers: [{ provide: ErrorHandler, useClass: CustomErrorHandler }],
  bootstrap: [AppComponent],
})
export class AppModule {}
