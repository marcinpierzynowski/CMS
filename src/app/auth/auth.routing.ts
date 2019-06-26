import { Routes, RouterModule } from '@angular/router';

import { AppSignInComponent } from './app-sign-in/app-sign-in.component';
import { AppSignUpComponent } from './app-sign-up/app-sign-up.component';
import { AppResetPasswordComponent } from './app-reset-password/app-reset-password.component';

const routes: Routes = [
  {
    path: '',
    children: [
        {
          path: '',
          redirectTo: 'sign-in',
          pathMatch: 'full'
        },
        {
          path: 'sign-in',
          component: AppSignInComponent
        },
        {
            path: 'sign-up',
            component: AppSignUpComponent
        },
        {
            path: 'reset-password',
            component: AppResetPasswordComponent
        }
    ]
  },
];

export const AuthRoutes = RouterModule.forChild(routes);
