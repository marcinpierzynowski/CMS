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
import { AppNewOrdersComponent } from './my-orders/app-new-orders/app-new-orders.component';
import { AppCompletedOrdersComponent } from './my-orders/app-completed-orders/app-completed-orders.component';
import { AppDetailOrderComponent } from './my-orders/app-detail-order/app-detail-order.component';
import { AppNewMessagesComponent } from './messages/app-new-messages/app-new-messages.component';
import { AppReceivedMessagesComponent } from './messages/app-received-messages/app-received-messages.component';
import { AppReviewsComponent } from './notifications/app-reviews/app-reviews.component';
import { AppEvaluationComponent } from './notifications/app-evaluation/app-evaluation.component';
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
import { ModalMessageComponent } from 'src/shared/components/modal-message/modal-message.component';
import { ModalManageService } from '../services/modal-manage.service';
import { SelectFilterComponent } from 'src/shared/components/select-filter/select-filter.component';
import { AppDetailsProductComponent } from './my-products/app-list-products/app-details-product/app-details-product.component';
import ManageData from './app-manage-data';
import { ReceivedMessageModalComponent } from 'src/shared/components/received-message-modal/received-message-modal.component';

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
    AppDetailsProductComponent,
    AppNewOrdersComponent,
    AppCompletedOrdersComponent,
    AppDetailOrderComponent,
    AppNewMessagesComponent,
    AppReceivedMessagesComponent,
    AppReviewsComponent,
    AppEvaluationComponent,
    CurrentPageComponent,
    DatepickerRangeComponent,
    MultipleComponent,
    NotificationComponent,
    ModalMessageComponent,
    ReceivedMessageModalComponent,
    SelectFilterComponent
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
    MessagesManageService,
    ModalManageService,
    ManageData
  ]
})
export class AppLayoutModule { }
