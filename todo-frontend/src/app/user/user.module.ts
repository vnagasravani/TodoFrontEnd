import { NgModule  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import { UserRoutingModule } from './user-routing.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ToastrModule } from 'ngx-toastr';




@NgModule({
  declarations: [LoginComponent, SignupComponent, ForgotPasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
    UserRoutingModule
   
  ],
  exports:[UserRoutingModule]
})
export class UserModule { }
