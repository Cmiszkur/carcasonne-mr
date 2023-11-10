import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonsModule } from '../commons/commons.module';

@NgModule({
  declarations: [RegisterComponent, LoginComponent],
  imports: [CommonModule, CommonsModule, UserRoutingModule, HttpClientModule],
})
export class UserModule {}
