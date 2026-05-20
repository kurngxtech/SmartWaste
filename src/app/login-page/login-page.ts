import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

@Component({
   selector: 'app-login-page',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
   templateUrl: './login-page.html'
})
export class LoginPage {
   loginForm: FormGroup;
   emailNotFound = false;
   serverError = '';
   isLoading = false;

   // 2FA state
   requiresTwoFactor = false;
   twoFactorCode = '';
   twoFactorError = '';
   twoFactorEmail = ''; // Email of the user who needs 2FA
   twoFactorCooldown = 0;
   private twoFactorInterval: any;
   twoFactorResendSuccess = '';

   constructor(private fb: FormBuilder, public authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
      this.loginForm = this.fb.group({
         email: ['', [Validators.required, Validators.email]],
         password: ['', [Validators.required, Validators.minLength(6)]],
         rememberMe: [false]
      });
   }

   get f() { return this.loginForm.controls; }

   startTwoFactorCooldown(): void {
      if (this.twoFactorInterval) {
         clearInterval(this.twoFactorInterval);
      }
      this.twoFactorInterval = setInterval(() => {
         if (this.twoFactorCooldown > 0) {
            this.twoFactorCooldown--;
            this.cdr.detectChanges();
         } else {
            clearInterval(this.twoFactorInterval);
         }
      }, 1000);
   }

   resendTwoFactor(): void {
      if (this.isLoading || this.twoFactorCooldown > 0) return;
      this.isLoading = true;
      this.twoFactorError = '';
      this.twoFactorResendSuccess = '';

      this.authService.resend2FA(this.twoFactorEmail).subscribe({
         next: (res) => {
            this.isLoading = false;
            this.twoFactorResendSuccess = res.message || 'A new code has been sent!';
            this.twoFactorCooldown = 30; // 30s cooldown
            this.startTwoFactorCooldown();
            this.cdr.detectChanges();
         },
         error: (err) => {
            this.isLoading = false;
            this.twoFactorError = err.error?.message || 'Could not resend code. Please try again.';
            this.cdr.detectChanges();
         }
      });
   }

   onSubmit(): void {
      if (this.loginForm.valid) {
         this.emailNotFound = false;
         this.serverError = '';
         this.isLoading = true;

         this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
               this.isLoading = false;
               if (res.success) {
                  if (res.requiresTwoFactor) {
                     // Backend detected 2FA — show verification panel
                     this.requiresTwoFactor = true;
                     this.twoFactorEmail = res.user?.email || this.loginForm.value.email;
                     this.twoFactorCooldown = 0;
                     this.twoFactorResendSuccess = '';
                     if (this.twoFactorInterval) clearInterval(this.twoFactorInterval);
                  } else {
                     // No 2FA — go straight to dashboard
                     this.router.navigate(['/dashboard']);
                  }
               }
               this.cdr.detectChanges();
            },
            error: (err) => {
               this.isLoading = false;
               this.emailNotFound = true;
               this.serverError = err.error?.message || 'Invalid email or password';
               this.cdr.detectChanges();
            }
         });
      } else {
         this.loginForm.markAllAsTouched();
      }
   }

   verifyTwoFactor(): void {
      if (this.twoFactorCode.length !== 6) {
         this.twoFactorError = 'Please enter a valid 6-digit code';
         return;
      }

      this.isLoading = true;
      this.twoFactorError = '';

      this.authService.verify2FA(this.twoFactorEmail, this.twoFactorCode).subscribe({
         next: (res) => {
            this.isLoading = false;
            if (res.success) {
               this.requiresTwoFactor = false;
               if (this.twoFactorInterval) clearInterval(this.twoFactorInterval);
               this.router.navigate(['/dashboard']);
            }
            this.cdr.detectChanges();
         },
         error: (err) => {
            this.isLoading = false;
            this.twoFactorError = err.error?.message || 'Invalid verification code';
            this.cdr.detectChanges();
         }
      });
   }

   cancelTwoFactor(): void {
      this.requiresTwoFactor = false;
      this.twoFactorCode = '';
      this.twoFactorError = '';
      this.twoFactorResendSuccess = '';
      this.twoFactorCooldown = 0;
      if (this.twoFactorInterval) {
         clearInterval(this.twoFactorInterval);
      }
   }
}