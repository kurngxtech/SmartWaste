import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { SignUpPageComponent } from './sign-up-page/sign-up-page';
import { UserLayout } from './user-page/user-layout/user-layout';
import { DashboardPage } from './user-page/dashboard-page/dashboard-page';
import { FoodInventoryPage } from './user-page/food-inventory-page/food-inventory-page';
import { MealPlannerPage } from './user-page/meal-planner-page/meal-planner-page';

export const routes: Routes = [
  { path: '', component: LoginPage },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignUpPageComponent },

  {
    path: '',
    component: UserLayout,           // ← ini wrapper dengan sidebar
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'inventory', component: FoodInventoryPage },
      { path: 'meal-planner', component: MealPlannerPage },
    ]
  },
];