import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { routes } from './app.routing';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { AppNotFoundComponent } from './other/app-not-found/app-not-found.component';

import { FirebaseService } from './services/firebase.service';
import { SharedModule } from 'src/shared/shared.module';
import { RouterModule } from '@angular/router';
import { LayoutManageService } from './services/layout-manage.service';

@NgModule({
  declarations: [
    AppComponent,
    AppNotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
  ],
  providers: [
    FirebaseService,
    LayoutManageService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
