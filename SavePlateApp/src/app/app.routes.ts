import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { SignUpPageComponent } from './sign-up-page/sign-up-page';
import { DashboardPage } from './user-page/dashboard-page/dashboard-page';
import { FoodInventoryPageComponent } from './user-page/food-inventory-page/food-inventory-page';
import { MealPlannerPage } from './user-page/meal-planner-page/meal-planner-page';
import { DonationHubPage } from './user-page/donation-hub-page/donation-hub-page';

export const routes: Routes = [
  // { path: '', component: LoginPage },
  // { path: 'signup', component: SignUpPageComponent },
  // { path: 'login', component: LoginPage },
  { path: '', component: DashboardPage },
  { path: 'inventory', component: FoodInventoryPageComponent },
  { path: 'planner', component: MealPlannerPage },
  { path: 'donations', component: DonationHubPage },
];
