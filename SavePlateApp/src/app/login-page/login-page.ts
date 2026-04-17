import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
   selector: 'app-login-page',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterLink],
   templateUrl: './login-page.html'
})
export class LoginPage {
   loginForm: FormGroup;

   constructor(private fb: FormBuilder) {
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
         // In Task 2, we will connect this to the Node.js backend
      }
   }
}