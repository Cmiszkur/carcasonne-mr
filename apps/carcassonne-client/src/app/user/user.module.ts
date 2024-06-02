import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonsModule } from '../commons/commons.module';
import { FormsModule } from '@angular/forms';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RegistrationSuccessComponent } from './registration-success/registration-success.component';
import { SuccessSvgComponent } from '@carcassonne-client/src/app/commons/components/svg/success-svg.component';

@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    ConfirmEmailComponent,
    RegistrationSuccessComponent,
  ],
  imports: [
    CommonModule,
    CommonsModule,
    UserRoutingModule,
    HttpClientModule,
    FormsModule,
    MatProgressSpinnerModule,
    SuccessSvgComponent,
  ],
})
export class UserModule {}
