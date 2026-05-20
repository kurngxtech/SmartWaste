import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

@Component({
   selector: 'app-forgot-password',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterLink],
   templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {
   forgotForm: FormGroup;
   isLoading = false;
   isSubmitted = false;   // Switches to success state after submit
   serverError = '';

   cooldown = 0;
   private cooldownInterval: any;

   constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private cdr: ChangeDetectorRef
   ) {
      this.forgotForm = this.fb.group({
         email: ['', [Validators.required, Validators.email]]
      });
   }

   get f() { return this.forgotForm.controls; }

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

   resendLink(): void {
      if (this.isLoading || this.cooldown > 0) return;
      this.onSubmit();
      this.cooldown = 30; // 30s cooldown
      this.startCooldown();
   }

   onSubmit(): void {
      if (this.forgotForm.valid) {
         this.serverError = '';
         this.isLoading = true;

         this.authService.forgotPassword(this.f['email'].value).subscribe({
            next: () => {
               this.isLoading = false;
               this.isSubmitted = true;   // Show success panel regardless of whether email exists
               this.cdr.detectChanges();
            },
            error: (err) => {
               this.isLoading = false;
               this.serverError = err.error?.message || 'Something went wrong. Please try again.';
               this.cdr.detectChanges();
            }
         });
      } else {
         this.forgotForm.markAllAsTouched();
      }
   }

   tryAgain(): void {
      this.isSubmitted = false;
      this.forgotForm.reset();
      this.serverError = '';
      this.cooldown = 0;
      if (this.cooldownInterval) {
         clearInterval(this.cooldownInterval);
      }
   }
}
