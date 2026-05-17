import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { UserSettingsService } from '../services/user-settings.service';
@Component({
   selector: 'app-login-page',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterLink],
   templateUrl: './login-page.html'
})
export class LoginPage {
   loginForm: FormGroup;
   emailNotFound = false;

   constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private userSettingsService: UserSettingsService) {
      // Initializing the form with validations for Iteration 1
      this.loginForm = this.fb.group({
         email: ['', [Validators.required, Validators.email]],
         password: ['', [Validators.required, Validators.minLength(6)]],
         rememberMe: [false]
      });
   }

   // Getter for easy access to form fields in HTML
   get f() { return this.loginForm.controls; }

   onSubmit(): void {
      if (this.loginForm.valid) {
         console.log('Login attempt:', this.loginForm.value);
         const email = this.loginForm.get('email')?.value;
         if (this.authService.checkEmailExists(email)) {
            const user = this.authService.getUserByEmail(email);
            if (user) {
               this.userSettingsService.updateProfile({ name: user.fullName, email: user.email, householdSize: user.householdSize, phone: user.phone });
            }
            this.emailNotFound = false;
            this.router.navigate(['/dashboard']);
         } else {
            this.emailNotFound = true;
         }
      }
   }
}