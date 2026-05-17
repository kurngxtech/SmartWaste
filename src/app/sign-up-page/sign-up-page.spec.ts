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

   it('create the component', () => {
      expect(component).toBeTruthy();
   });

   describe('Positive Scenarios', () => {
      it('1. User input valid data Username, Email, Password, and Household User', () => {
         component.signUpForm.controls['fullName'].setValue('Dummy User');
         component.signUpForm.controls['email'].setValue('dummyaccount@google.com');
         component.signUpForm.controls['password'].setValue('dummy1234!');
         component.signUpForm.controls['householdSize'].setValue(2);
         expect(component.signUpForm.valid).toBeTruthy();
      });

      it('2. User input valid 6-digits verification code', () => {
         // Setup: get into verification mode first
         component.isVerificationMode = true;
         component.verificationForm.controls['code'].setValue('123456');
         expect(component.verificationForm.valid).toBeTruthy();
      });

      it('3. Registration success and auto-direct to login page', () => {
         component.signUpForm.controls['email'].setValue('dummyaccount@google.com');
         component.verificationForm.controls['code'].setValue('123456');
         mockAuthService.verifyCodeAndRegister.mockReturnValue(true);

         component.onVerify();

         expect(mockAuthService.verifyCodeAndRegister).toHaveBeenCalledWith('dummyaccount@google.com', '123456');
         expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });
   });

   describe('Negative Scenarios', () => {
      it('1. User leave one or more field(s) blank', () => {
         // Full name is blank
         component.signUpForm.controls['fullName'].setValue('');
         component.signUpForm.controls['email'].setValue('test@google.com');
         expect(component.signUpForm.valid).toBeFalsy();
      });

      it('2. User input non-google account to register', () => {
         component.signUpForm.controls['fullName'].setValue('John Doe');
         component.signUpForm.controls['email'].setValue('test@yahoo.com');
         component.signUpForm.controls['password'].setValue('password123');
         component.signUpForm.controls['householdSize'].setValue(2);
         mockAuthService.sendVerificationEmail.mockReturnValue(false);

         component.onSubmit();

         expect(component.notGoogleEmailError).toBe(true);
         expect(component.isVerificationMode).toBe(false);
      });

      it('3. User input wrong 6-digits verification code', () => {
         component.signUpForm.controls['email'].setValue('john@google.com');
         component.verificationForm.controls['code'].setValue('000000'); // Wrong code
         mockAuthService.verifyCodeAndRegister.mockReturnValue(false);

         component.onVerify();

         expect(component.verificationError).toBe(true);
         expect(router.navigate).not.toHaveBeenCalled();
      });

      it('4. User leave the verification field blank', () => {
         component.isVerificationMode = true;
         component.verificationForm.controls['code'].setValue('');
         expect(component.verificationForm.valid).toBeFalsy();
      });
   });
});
