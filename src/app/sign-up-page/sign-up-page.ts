import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

/** Custom validator: rejects email addresses that are not @gmail.com */
function gmailOnlyValidator(control: AbstractControl): ValidationErrors | null {
   const value: string = (control.value || '').toLowerCase().trim();
   if (!value) return null; // Let required validator handle empty
   if (!value.endsWith('@gmail.com')) {
      return { gmailOnly: true };
   }
   return null;
}

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
   verificationError = false;
   serverError = '';
   cooldown = 0;
   private cooldownInterval: any;
   isLoading = false;
   emailDeliveryWarning = false;
   resendSuccess = false;

   constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
      this.signUpForm = this.fb.group({
         fullName: ['', [Validators.required]],
         email: ['', [Validators.required, Validators.email, gmailOnlyValidator]],
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

   startCooldown(): void {
      if (this.cooldownInterval) {
         clearInterval(this.cooldownInterval);
      }
      this.cooldownInterval = setInterval(() => {
         if (this.cooldown > 0) {
            this.cooldown--;
            this.cdr.detectChanges();
         } else {
            clearInterval(this.cooldownInterval);
         }
      }, 1000);
   }

   onSubmit(): void {
      if (this.isLoading) return; // guard: prevent double-submit race condition
      if (this.signUpForm.valid) {
         this.serverError = '';
         this.emailDeliveryWarning = false;
         this.resendSuccess = false;
         this.isLoading = true;

         this.authService.register(this.signUpForm.value).subscribe({
            next: (res) => {
               this.isLoading = false;
               if (res.success) {
                  // Backend returned 201 — email was sent normally
                  this.isVerificationMode = true;
               } else if (res.emailError) {
                  // 200 with emailError shouldn't happen, but guard it
                  this.emailDeliveryWarning = true;
                  this.isVerificationMode = true;
               }
               this.cdr.detectChanges();
            },
            error: (err) => {
               this.isLoading = false;
               if (err.error?.emailError) {
                  // Account created in DB but OTP email failed — go to verification
                  // screen so the user can click Resend Code instead of redoing the form
                  this.emailDeliveryWarning = true;
                  this.isVerificationMode = true;
               } else {
                  this.serverError = err.error?.message || 'Server error during registration';
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
                  if (this.cooldownInterval) clearInterval(this.cooldownInterval);
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
      this.serverError = '';
      this.emailDeliveryWarning = false;
      this.resendSuccess = false;
      this.cooldown = 0;
      if (this.cooldownInterval) clearInterval(this.cooldownInterval);
   }

   resendCode(): void {
      if (this.isLoading || this.cooldown > 0) return;
      const email = this.signUpForm.get('email')?.value;
      if (!email) return;

      this.isLoading = true;
      this.resendSuccess = false;
      this.emailDeliveryWarning = false;
      this.serverError = '';

      this.authService.resendVerification(email).subscribe({
         next: () => {
            this.isLoading = false;
            this.resendSuccess = true;
            this.cooldown = 30; // 30 seconds cooldown
            this.startCooldown();
            this.cdr.detectChanges();
         },
         error: (err) => {
            this.isLoading = false;
            this.serverError = err.error?.message || 'Could not resend verification code. Please try again.';
            this.cdr.detectChanges();
         }
      });
   }
}