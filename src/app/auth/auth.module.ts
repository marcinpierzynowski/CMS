import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutes } from './auth.routing';
import { SharedModule } from 'src/shared/shared.module';

import { AppSignInComponent } from './app-sign-in/app-sign-in.component';
import { AppSignUpComponent } from './app-sign-up/app-sign-up.component';
import { AppResetPasswordComponent } from './app-reset-password/app-reset-password.component';


@NgModule({
    declarations: [
      AppSignInComponent,
      AppSignUpComponent,
      AppResetPasswordComponent
    ],
    imports: [
      CommonModule,
      SharedModule,
      AuthRoutes
    ]
})
export class AuthModule {}
