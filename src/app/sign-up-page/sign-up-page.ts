import { Component, ChangeDetectorRef } from '@angular/core';
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
   verificationForm: FormGroup;
   isVerificationMode = false;
   notGoogleEmailError = false;
   verificationError = false;
   serverError = '';
   isLoading = false;

   constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
      this.signUpForm = this.fb.group({
         fullName: ['', [Validators.required]],
         email: ['', [Validators.required, Validators.email]],
         phone: ['', [Validators.required]],
         password: ['', [Validators.required, Validators.minLength(6)]],
         householdSize: ['', [Validators.required, Validators.min(1)]]
      });

      this.verificationForm = this.fb.group({
         code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      });
   }

   get f() { return this.signUpForm.controls; }
   get v() { return this.verificationForm.controls; }

   onSubmit(): void {
      if (this.signUpForm.valid) {
         this.notGoogleEmailError = false;
         this.serverError = '';
         this.isLoading = true;

         this.authService.register(this.signUpForm.value).subscribe({
            next: (res) => {
               this.isLoading = false;
               if (res.success) {
                  this.isVerificationMode = true;
               }
               this.cdr.detectChanges();
            },
            error: (err) => {
               this.isLoading = false;
               this.serverError = err.error?.message || 'Server error during registration';
               if (this.serverError.includes('already registered')) {
                  this.notGoogleEmailError = true; // Use this flag to show generic error if needed
               }
               this.cdr.detectChanges();
            }
         });
      } else {
         this.signUpForm.markAllAsTouched();
      }
   }

   onVerify(): void {
      if (this.verificationForm.valid) {
         this.verificationError = false;
         this.serverError = '';
         this.isLoading = true;

         const email = this.signUpForm.get('email')?.value;
         const code = this.verificationForm.get('code')?.value;

         this.authService.verifyEmail(email, code).subscribe({
            next: (res) => {
               this.isLoading = false;
               if (res.success) {
                  this.router.navigate(['/login']);
               }
               this.cdr.detectChanges();
            },
            error: (err) => {
               this.isLoading = false;
               this.verificationError = true;
               this.serverError = err.error?.message || 'Invalid code';
               this.cdr.detectChanges();
            }
         });
      } else {
         this.verificationForm.markAllAsTouched();
      }
   }

   goBackToSignUp(): void {
      this.isVerificationMode = false;
      this.verificationForm.reset();
      this.verificationError = false;
      this.notGoogleEmailError = false;
      this.serverError = '';
   }
}