import { Routes, RouterModule } from '@angular/router';

import { AppLayoutComponent } from './app-layout.component';
import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { AppMyProfilComponent } from './my-account/app-my-profil/app-my-profil.component';
import { AppMySettingsComponent } from './my-account/app-my-settings/app-my-settings.component';
import { AppAddProductsComponent } from './my-products/app-add-products/app-add-products.component';
import { AppListProductsComponent } from './my-products/app-list-products/app-list-products.component';
import { AppNewMessagesComponent } from './messages/app-new-messages/app-new-messages.component';
import { AppReceivedMessagesComponent } from './messages/app-received-messages/app-received-messages.component';
import { AppCommentsComponent } from './notifications/app-comments/app-comments.component';
import { AppEvaluationComponent } from './notifications/app-evaluation/app-evaluation.component';
import { AppSliderComponent } from './pages-properties/app-slider/app-slider.component';
import { AppPromotionComponent } from './pages-properties/app-promotion/app-promotion.component';
import { AppEditProductComponent } from './my-products/app-list-products/app-edit-product/app-edit-product.component';
import { AppEditMessageComponent } from './messages/app-edit-message/app-edit-message.component';
import { AppListAdminsComponent } from './my-users/app-list-admins/app-list-admins.component';
import { AppListCustomersComponent } from './my-users/app-list-customers/app-list-customers.component';

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
          path: 'list-products',
          component: AppListProductsComponent
        },
        {
          path: 'list-products/:id',
          component: AppEditProductComponent
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
          path: 'edit-message/:id',
          component: AppEditMessageComponent
        },
        {
          path: 'comments',
          component: AppCommentsComponent
        },
        {
          path: 'evaluations',
          component: AppEvaluationComponent
        },
        {
          path: 'slider',
          component: AppSliderComponent
        },
        {
          path: 'promotions',
          component: AppPromotionComponent
        },
    ]
  },
];

export const PageRoutes = RouterModule.forChild(routes);
