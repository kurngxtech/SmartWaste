import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
   selector: 'app-sign-up-page',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterLink],
   templateUrl: './sign-up-page.html'
})
export class SignUpPageComponent {
   signUpForm: FormGroup;

   constructor(private fb: FormBuilder) {
      this.signUpForm = this.fb.group({
         fullName: ['', [Validators.required]],
         email: ['', [Validators.required, Validators.email]],
         password: ['', [Validators.required, Validators.minLength(6)]],
         householdSize: ['', [Validators.required, Validators.min(1)]]
      });
   }

   // Getter to simplify accessing form controls in the template
   get f() { return this.signUpForm.controls; }

   onSubmit(): void {
      if (this.signUpForm.valid) {
         console.log('Registration details:', this.signUpForm.value);
         // In Iteration 1 Task 2, we will send this data to the Express backend to save in the DB
      } else {
         // Mark all as touched to show errors if user clicks submit prematurely
         this.signUpForm.markAllAsTouched();
      }
   }
}