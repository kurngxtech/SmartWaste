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
   verificationForm: FormGroup;
   isVerificationMode = false;
   notGoogleEmailError = false;
   verificationError = false;

   constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
      this.signUpForm = this.fb.group({
         fullName: ['', [Validators.required]],
         email: ['', [Validators.required, Validators.email]],
         password: ['', [Validators.required, Validators.minLength(6)]],
         householdSize: ['', [Validators.required, Validators.min(1)]]
      });

      this.verificationForm = this.fb.group({
         code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      });
   }

   // Getter to simplify accessing form controls in the template
   get f() { return this.signUpForm.controls; }
   get v() { return this.verificationForm.controls; }

   onSubmit(): void {
      if (this.signUpForm.valid) {
         this.notGoogleEmailError = false;
         
         // Try to send verification email (fails if not a google email)
         const isGoogleEmail = this.authService.sendVerificationEmail(this.signUpForm.value);
         
         if (isGoogleEmail) {
            this.isVerificationMode = true;
         } else {
            this.notGoogleEmailError = true;
         }
      } else {
         // Mark all as touched to show errors if user clicks submit prematurely
         this.signUpForm.markAllAsTouched();
      }
   }

   onVerify(): void {
      if (this.verificationForm.valid) {
         this.verificationError = false;
         const email = this.signUpForm.get('email')?.value;
         const code = this.verificationForm.get('code')?.value;

         const isValid = this.authService.verifyCodeAndRegister(email, code);
         
         if (isValid) {
            this.router.navigate(['/login']);
         } else {
            this.verificationError = true;
         }
      } else {
         this.verificationForm.markAllAsTouched();
      }
   }

   goBackToSignUp(): void {
      this.isVerificationMode = false;
      this.verificationForm.reset();
      this.verificationError = false;
      this.notGoogleEmailError = false;
   }
}