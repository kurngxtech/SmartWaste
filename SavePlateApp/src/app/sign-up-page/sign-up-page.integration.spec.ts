import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { SignUpPageComponent } from './sign-up-page';
import { AuthService } from '../authentication/auth.service';
import { vi } from 'vitest';

describe('SignUpPageComponent - Integration with AuthService', () => {
   let component: SignUpPageComponent;
   let fixture: ComponentFixture<SignUpPageComponent>;
   let authService: AuthService;
   let router: Router;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [SignUpPageComponent, ReactiveFormsModule],
         providers: [
            provideRouter([]),
            AuthService // Providing the REAL service instead of a mock
         ]
      }).compileComponents();

      router = TestBed.inject(Router);
      authService = TestBed.inject(AuthService);
      vi.spyOn(router, 'navigate');
      vi.spyOn(console, 'log').mockImplementation(() => {}); // hide console logs from authService

      fixture = TestBed.createComponent(SignUpPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('should complete the full sign-up and verification flow successfully', () => {
      // 1. Fill out the sign up form with valid details
      component.signUpForm.controls['fullName'].setValue('Integration Test User');
      component.signUpForm.controls['email'].setValue('integration@gmail.com');
      component.signUpForm.controls['password'].setValue('password123');
      component.signUpForm.controls['householdSize'].setValue(3);

      expect(component.signUpForm.valid).toBe(true);

      // We need to spy on Math.random to know what code the REAL service generates
      vi.spyOn(Math, 'random').mockReturnValue(0.5); 
      // Code will be: Math.floor(100000 + 0.5 * 900000) = Math.floor(100000 + 450000) = 550000

      // 2. Submit the sign up form
      component.onSubmit();

      // Ensure component transitions to verification mode
      expect(component.isVerificationMode).toBe(true);
      expect(component.notGoogleEmailError).toBe(false);

      // Verify the REAL service stored the pending registration
      const pendingReg = (authService as any).pendingRegistrations.get('integration@gmail.com');
      expect(pendingReg).toBeTruthy();
      expect(pendingReg.code).toBe('550000');

      // 3. Fill out the verification form with the correct code
      component.verificationForm.controls['code'].setValue('550000');

      // 4. Submit verification
      component.onVerify();

      // Verify the component handles successful verification (redirects to login)
      expect(component.verificationError).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);

      // Verify the REAL service removed the pending registration and added to users
      expect((authService as any).pendingRegistrations.has('integration@gmail.com')).toBe(false);
      expect(authService.checkEmailExists('integration@gmail.com')).toBe(true);
   });

   it('should fail verification if incorrect code is entered', () => {
      // 1. Sign up
      component.signUpForm.controls['fullName'].setValue('Failed Verif User');
      component.signUpForm.controls['email'].setValue('fail@gmail.com');
      component.signUpForm.controls['password'].setValue('password123');
      component.signUpForm.controls['householdSize'].setValue(1);

      vi.spyOn(Math, 'random').mockReturnValue(0.1); // Code: 190000
      component.onSubmit();

      expect(component.isVerificationMode).toBe(true);

      // 2. Enter WRONG code
      component.verificationForm.controls['code'].setValue('999999');
      component.onVerify();

      // Component should show error and NOT navigate
      expect(component.verificationError).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();

      // Real service should NOT have registered the user
      expect(authService.checkEmailExists('fail@gmail.com')).toBe(false);
   });

   it('should reject sign up completely if email is not a Google email', () => {
      // 1. Enter non-Google email
      component.signUpForm.controls['fullName'].setValue('Non Google User');
      component.signUpForm.controls['email'].setValue('user@yahoo.com');
      component.signUpForm.controls['password'].setValue('password123');
      component.signUpForm.controls['householdSize'].setValue(1);

      // 2. Submit
      component.onSubmit();

      // Component should show email error and NOT go to verification mode
      expect(component.isVerificationMode).toBe(false);
      expect(component.notGoogleEmailError).toBe(true);

      // Real service should not have added anything to pending registrations
      expect((authService as any).pendingRegistrations.has('user@yahoo.com')).toBe(false);
   });
});
