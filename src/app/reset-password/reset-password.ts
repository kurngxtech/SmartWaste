import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

/** Cross-field validator: newPassword and confirmPassword must match */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
   const pw = group.get('newPassword')?.value;
   const confirm = group.get('confirmPassword')?.value;
   if (pw && confirm && pw !== confirm) {
      return { passwordMismatch: true };
   }
   return null;
}

@Component({
   selector: 'app-reset-password',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterLink],
   templateUrl: './reset-password.html'
})
export class ResetPasswordComponent implements OnInit {
   resetForm: FormGroup;
   isLoading = false;
   isSuccess = false;
   serverError = '';
   tokenError = '';

   private token = '';
   private email = '';

   constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef
   ) {
      this.resetForm = this.fb.group(
         {
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
         },
         { validators: passwordMatchValidator }
      );
   }

   ngOnInit(): void {
      // Read token + email from query params provided by the reset link in the email
      this.route.queryParams.subscribe(params => {
         this.token = params['token'] || '';
         this.email = params['email'] || '';

         if (!this.token || !this.email) {
            this.tokenError = 'Invalid or missing reset link. Please request a new one.';
         }
         this.cdr.detectChanges();
      });
   }

   get f() { return this.resetForm.controls; }
   get passwordMismatch(): boolean {
      return this.resetForm.errors?.['passwordMismatch'] && this.f['confirmPassword'].touched;
   }

   onSubmit(): void {
      if (this.resetForm.valid && this.token && this.email) {
         this.serverError = '';
         this.isLoading = true;

         this.authService.resetPassword(this.token, this.email, this.f['newPassword'].value).subscribe({
            next: () => {
               this.isLoading = false;
               this.isSuccess = true;
               this.cdr.detectChanges();
               // Auto-redirect to login after 3 seconds
               setTimeout(() => this.router.navigate(['/login']), 3000);
            },
            error: (err) => {
               this.isLoading = false;
               this.serverError = err.error?.message || 'Failed to reset password. The link may have expired.';
               this.cdr.detectChanges();
            }
         });
      } else {
         this.resetForm.markAllAsTouched();
      }
   }
}
