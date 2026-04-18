import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { SignUpPageComponent } from './sign-up-page';
import { AuthService } from '../authentication/auth.service';
import { vi } from 'vitest';

describe('SignUpPageComponent', () => {
   let component: SignUpPageComponent;
   let fixture: ComponentFixture<SignUpPageComponent>;
   let mockAuthService: any;
   let router: Router;

   beforeEach(async () => {
      mockAuthService = {
         sendVerificationEmail: vi.fn(),
         verifyCodeAndRegister: vi.fn()
      };

      await TestBed.configureTestingModule({
         imports: [SignUpPageComponent, ReactiveFormsModule],
         providers: [
            provideRouter([]),
            { provide: AuthService, useValue: mockAuthService }
         ]
      }).compileComponents();

      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate');

      fixture = TestBed.createComponent(SignUpPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('should have invalid form when empty', () => {
      expect(component.signUpForm.valid).toBeFalsy();
   });

   it('should have valid form when all fields are filled correctly', () => {
      component.signUpForm.controls['fullName'].setValue('John Doe');
      component.signUpForm.controls['email'].setValue('john@example.com');
      component.signUpForm.controls['password'].setValue('password123');
      component.signUpForm.controls['householdSize'].setValue(2);
      expect(component.signUpForm.valid).toBeTruthy();
   });

   describe('onSubmit', () => {
      beforeEach(() => {
         component.signUpForm.controls['fullName'].setValue('John Doe');
         component.signUpForm.controls['email'].setValue('john@google.com');
         component.signUpForm.controls['password'].setValue('password123');
         component.signUpForm.controls['householdSize'].setValue(2);
      });

      it('should set isVerificationMode to true if email is valid and Google email', () => {
         mockAuthService.sendVerificationEmail.mockReturnValue(true);
         component.onSubmit();
         expect(component.isVerificationMode).toBe(true);
         expect(component.notGoogleEmailError).toBe(false);
      });

      it('should set notGoogleEmailError to true if email is not a Google email', () => {
         mockAuthService.sendVerificationEmail.mockReturnValue(false);
         component.onSubmit();
         expect(component.notGoogleEmailError).toBe(true);
         expect(component.isVerificationMode).toBe(false);
      });
   });

   describe('onVerify', () => {
      beforeEach(() => {
         component.signUpForm.controls['email'].setValue('john@google.com');
         component.verificationForm.controls['code'].setValue('123456');
      });

      it('should navigate to login if verification is successful', () => {
         mockAuthService.verifyCodeAndRegister.mockReturnValue(true);
         component.onVerify();
         expect(router.navigate).toHaveBeenCalledWith(['/login']);
         expect(component.verificationError).toBe(false);
      });

      it('should set verificationError to true if verification fails', () => {
         mockAuthService.verifyCodeAndRegister.mockReturnValue(false);
         component.onVerify();
         expect(component.verificationError).toBe(true);
         expect(router.navigate).not.toHaveBeenCalled();
      });
   });

   it('should reset state when goBackToSignUp is called', () => {
      component.isVerificationMode = true;
      component.verificationError = true;
      component.notGoogleEmailError = true;
      component.verificationForm.controls['code'].setValue('123456');

      component.goBackToSignUp();

      expect(component.isVerificationMode).toBe(false);
      expect(component.verificationError).toBe(false);
      expect(component.notGoogleEmailError).toBe(false);
      expect(component.verificationForm.controls['code'].value).toBeNull();
   });
});
