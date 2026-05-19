import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { SignUpPageComponent } from './sign-up-page/sign-up-page';
import { DashboardPage } from './user-page/dashboard-page/dashboard-page';
import { FoodInventoryPageComponent } from './user-page/food-inventory-page/food-inventory-page';
import { MealPlannerPage } from './user-page/meal-planner-page/meal-planner-page';
import { DonationHubPage } from './user-page/donation-hub-page/donation-hub-page';
import { NotificationsPage } from './user-page/notifications-page/notifications-page';
import { AppSettingsPage } from './user-page/app-settings-page/app-settings-page';
import { UserDetailPage } from './user-page/user-detail-page/user-detail-page';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ResetPasswordComponent } from './reset-password/reset-password';

export const routes: Routes = [
   { path: '', component: LoginPage },
   { path: 'signup', component: SignUpPageComponent },
   { path: 'login', component: LoginPage },
   { path: 'forgot-password', component: ForgotPasswordComponent },
   { path: 'reset-password', component: ResetPasswordComponent },
   { path: 'dashboard', component: DashboardPage },
   { path: 'inventory', component: FoodInventoryPageComponent },
   { path: 'planner', component: MealPlannerPage },
   { path: 'donations', component: DonationHubPage },
   { path: 'notifications', component: NotificationsPage },
   { path: 'appSettings', component: AppSettingsPage },
   { path: 'userDetail', component: UserDetailPage }
];
