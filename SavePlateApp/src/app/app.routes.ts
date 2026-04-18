import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { SignUpPageComponent } from './sign-up-page/sign-up-page';
import { DashboardPage } from './user-page/dashboard-page/dashboard-page';

export const routes: Routes = [
   { path: '', component: LoginPage },
   { path: 'signup', component: SignUpPageComponent },
   { path: 'login', component: LoginPage },
   { path: 'dashboard', component: DashboardPage }
];
