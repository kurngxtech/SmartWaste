import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

@Component({
   selector: 'app-login-page',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterLink],
   templateUrl: './login-page.html'
})
export class LoginPage {
   loginForm: FormGroup;
   emailNotFound = false;
   serverError = '';
   isLoading = false;

   constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
      this.loginForm = this.fb.group({
         email: ['', [Validators.required, Validators.email]],
         password: ['', [Validators.required, Validators.minLength(6)]],
         rememberMe: [false]
      });
   }

   get f() { return this.loginForm.controls; }

   onSubmit(): void {
      if (this.loginForm.valid) {
         this.emailNotFound = false;
         this.serverError = '';
         this.isLoading = true;

         this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
               this.isLoading = false;
               if (res.success) {
                  this.router.navigate(['/dashboard']);
               }
            },
            error: (err) => {
               this.isLoading = false;
               this.emailNotFound = true;
               this.serverError = err.error?.message || 'Invalid email or password';
            }
         });
      } else {
         this.loginForm.markAllAsTouched();
      }
   }
}