import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
@Component({
   selector: 'app-sign-up-page',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterLink],
   templateUrl: './sign-up-page.html'
})
export class SignUpPageComponent {
   signUpForm: FormGroup;

   constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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
         this.authService.register(this.signUpForm.value);
         this.router.navigate(['/login']);
      } else {
         // Mark all as touched to show errors if user clicks submit prematurely
         this.signUpForm.markAllAsTouched();
      }
   }
}