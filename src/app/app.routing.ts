import { Routes } from '@angular/router';

import { AppNotFoundComponent } from './other/app-not-found/app-not-found.component';

export const routes: Routes = [
  { path: '', loadChildren: './layout/app-layout.module#AppLayoutModule' },
  { path: 'auth', loadChildren: './auth/auth.module#AuthModule' },
  { path: '**', component: AppNotFoundComponent }
];
