import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PageRoutes } from './app-layout.routing';
import { SharedModule } from 'src/shared/shared.module';

import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { AppLayoutComponent } from './app-layout.component';
import { AppListUsersComponent } from './my-users/app-list-users/app-list-users.component';
import { AppMyProfilComponent } from './my-account/app-my-profil/app-my-profil.component';
import { AppMySettingsComponent } from './my-account/app-my-settings/app-my-settings.component';
import { AppAddProductsComponent } from './my-products/app-add-products/app-add-products.component';
import { AppAddProductsModalComponent } from './my-products/app-add-products/app-add-products-modal/app-add-products-modal.component';
import { AppListProductsComponent } from './my-products/app-list-products/app-list-products.component';
import { AppNewMessagesComponent } from './messages/app-new-messages/app-new-messages.component';
import { AppReceivedMessagesComponent } from './messages/app-received-messages/app-received-messages.component';
import { AppCommentsComponent } from './notifications/app-comments/app-comments.component';
import { AppEvaluationComponent } from './notifications/app-evaluation/app-evaluation.component';
import { AppSliderComponent } from './pages-properties/app-slider/app-slider.component';
import { AppPromotionComponent } from './pages-properties/app-promotion/app-promotion.component';

@NgModule({
    declarations: [
      AppLayoutComponent,
      AppDashboardComponent,
      AppMyProfilComponent,
      AppMySettingsComponent,
      AppListUsersComponent,
      AppAddProductsComponent,
      AppAddProductsModalComponent,
      AppListProductsComponent,
      AppNewMessagesComponent,
      AppReceivedMessagesComponent,
      AppCommentsComponent,
      AppEvaluationComponent,
      AppSliderComponent,
      AppPromotionComponent
    ],
    imports: [
      CommonModule,
      SharedModule,
      PageRoutes
    ],
    providers: [DatePipe]
})
export class AppLayoutModule {}
