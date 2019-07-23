import { Routes, RouterModule } from '@angular/router';

import { AppLayoutComponent } from './app-layout.component';
import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { AppMyProfilComponent } from './my-account/app-my-profil/app-my-profil.component';
import { AppMySettingsComponent } from './my-account/app-my-settings/app-my-settings.component';
import { AppAddProductsComponent } from './my-products/app-add-products/app-add-products.component';
import { AppListProductsComponent } from './my-products/app-list-products/app-list-products.component';
import { AppNewMessagesComponent } from './messages/app-new-messages/app-new-messages.component';
import { AppReceivedMessagesComponent } from './messages/app-received-messages/app-received-messages.component';
import { AppReviewsComponent } from './notifications/app-reviews/app-reviews.component';
import { AppEvaluationComponent } from './notifications/app-evaluation/app-evaluation.component';
import { AppListAdminsComponent } from './my-users/app-list-admins/app-list-admins.component';
import { AppListCustomersComponent } from './my-users/app-list-customers/app-list-customers.component';
import { AppDetailsProductComponent } from './my-products/app-list-products/app-details-product/app-details-product.component';
import { AppNewOrdersComponent } from './my-orders/app-new-orders/app-new-orders.component';
import { AppCompletedOrdersComponent } from './my-orders/app-completed-orders/app-completed-orders.component';
import { AppDetailOrderComponent } from './my-orders/app-detail-order/app-detail-order.component';
import { AppInvoiceComponent } from './my-orders/app-detail-order/app-invoice/app-invoice.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AppDashboardComponent
      },
      {
        path: 'my-profile',
        component: AppMyProfilComponent
      },
      {
        path: 'my-settings',
        component: AppMySettingsComponent
      },
      {
        path: 'list-admins',
        component: AppListAdminsComponent
      },
      {
        path: 'list-customers',
        component: AppListCustomersComponent
      },
      {
        path: 'add-product',
        component: AppAddProductsComponent
      },
      {
        path: 'add-product/:id',
        component: AppAddProductsComponent
      },
      {
        path: 'list-products',
        component: AppListProductsComponent
      },
      {
        path: 'list-new-orders',
        component: AppNewOrdersComponent
      },
      {
        path: 'list-completed-orders',
        component: AppCompletedOrdersComponent
      },
      {
        path: 'detail-order/:id',
        component: AppDetailOrderComponent
      },
      {
        path: 'invoice/:id',
        component: AppInvoiceComponent
      },
      {
        path: 'details-product/:id',
        component: AppDetailsProductComponent
      },
      {
        path: 'new-messages',
        component: AppNewMessagesComponent
      },
      {
        path: 'received-messages',
        component: AppReceivedMessagesComponent
      },
      {
        path: 'reviews',
        component: AppReviewsComponent
      },
      {
        path: 'evaluations',
        component: AppEvaluationComponent
      }
    ]
  },
];

export const PageRoutes = RouterModule.forChild(routes);
