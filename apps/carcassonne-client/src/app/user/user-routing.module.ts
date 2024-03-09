import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmEmailComponent } from '@carcassonne-client/src/app/user/confirm-email/confirm-email.component';
import { RegisterComponent } from '@carcassonne-client/src/app/user/register/register.component';
import { LoginComponent } from '@carcassonne-client/src/app/user/login/login.component';
import { RegistrationSuccessComponent } from '@carcassonne-client/src/app/user/registration-success/registration-success.component';

const userRoutes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'confirm-email/:token', component: ConfirmEmailComponent },
  { path: 'registration-success/:id', component: RegistrationSuccessComponent },
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
