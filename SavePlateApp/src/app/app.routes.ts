import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { SignUpPageComponent } from './sign-up-page/sign-up-page';

export const routes: Routes = [
   { path: '', component: LoginPage },
   { path: 'signup', component: SignUpPageComponent },
   { path: 'login', component: LoginPage }

];
