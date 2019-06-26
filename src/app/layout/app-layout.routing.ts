import { Routes, RouterModule } from '@angular/router';

import { AppLayoutComponent } from './app-layout.component';
import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { AppMyProfilComponent } from './my-account/app-my-profil/app-my-profil.component';
import { AppMySettingsComponent } from './my-account/app-my-settings/app-my-settings.component';
import { AppListUsersComponent } from './my-users/app-list-users/app-list-users.component';
import { AppAddProductsComponent } from './my-products/app-add-products/app-add-products.component';
import { AppListProductsComponent } from './my-products/app-list-products/app-list-products.component';
import { AppNewMessagesComponent } from './messages/app-new-messages/app-new-messages.component';
import { AppReceivedMessagesComponent } from './messages/app-received-messages/app-received-messages.component';
import { AppCommentsComponent } from './notifications/app-comments/app-comments.component';
import { AppEvaluationComponent } from './notifications/app-evaluation/app-evaluation.component';
import { AppSliderComponent } from './pages-properties/app-slider/app-slider.component';
import { AppPromotionComponent } from './pages-properties/app-promotion/app-promotion.component';

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
          path: 'list-users',
          component: AppListUsersComponent
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
          path: 'new-messages',
          component: AppNewMessagesComponent
        },
        {
          path: 'received-messages',
          component: AppReceivedMessagesComponent
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

// '/': 5,
// '/comments': 5,
// '/slider': 6,
// '/promotions': 6

export const PageRoutes = RouterModule.forChild(routes);
