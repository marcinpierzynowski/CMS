import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PageRoutes } from './app-layout.routing';
import { SharedModule } from 'src/shared/shared.module';

import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { AppLayoutComponent } from './app-layout.component';
import { AppMyProfilComponent } from './my-account/app-my-profil/app-my-profil.component';
import { AppMySettingsComponent } from './my-account/app-my-settings/app-my-settings.component';
import { AppAddProductsComponent } from './my-products/app-add-products/app-add-products.component';
import { AppListProductsComponent } from './my-products/app-list-products/app-list-products.component';
import { AppEditProductComponent } from './my-products/app-list-products/app-edit-product/app-edit-product.component';
import { AppNewMessagesComponent } from './messages/app-new-messages/app-new-messages.component';
import { AppReceivedMessagesComponent } from './messages/app-received-messages/app-received-messages.component';
import { AppCommentsComponent } from './notifications/app-comments/app-comments.component';
import { AppEvaluationComponent } from './notifications/app-evaluation/app-evaluation.component';
import { AppSliderComponent } from './pages-properties/app-slider/app-slider.component';
import { AppPromotionComponent } from './pages-properties/app-promotion/app-promotion.component';
import { AppEditMessageComponent } from './messages/app-edit-message/app-edit-message.component';
import { CurrentPageComponent } from 'src/shared/components/current-page/current-page.component';
import { CurrentPageService } from '../services/current-page.service';
import { OrdersManageService } from '../services/orders-manage.service';
import { ProductsManageService } from '../services/products-manage.service';
import { MessagesManageService } from '../services/messages-manage.service';
import { DatepickerRangeComponent } from 'src/shared/components/datepicker-range/datepicker-range.component';
import { MultipleComponent } from 'src/shared/components/multiple/multiple.component';
import { NotificationComponent } from 'src/shared/components/notification/notification.component';
import { AppListAdminsComponent } from './my-users/app-list-admins/app-list-admins.component';
import { AppListCustomersComponent } from './my-users/app-list-customers/app-list-customers.component';

@NgModule({
    declarations: [
      AppLayoutComponent,
      AppDashboardComponent,
      AppMyProfilComponent,
      AppMySettingsComponent,
      AppListAdminsComponent,
      AppListCustomersComponent,
      AppAddProductsComponent,
      AppListProductsComponent,
      AppEditProductComponent,
      AppNewMessagesComponent,
      AppReceivedMessagesComponent,
      AppEditMessageComponent,
      AppCommentsComponent,
      AppEvaluationComponent,
      AppSliderComponent,
      AppPromotionComponent,
      CurrentPageComponent,
      DatepickerRangeComponent,
      MultipleComponent,
      NotificationComponent
    ],
    imports: [
      CommonModule,
      SharedModule,
      PageRoutes
    ],
    providers: [
      DatePipe,
      CurrentPageService,
      OrdersManageService,
      ProductsManageService,
      MessagesManageService
    ]
})
export class AppLayoutModule {}
