import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login-page';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { vi } from 'vitest';

describe('LoginPage', () => {
   let component: LoginPage;
   let fixture: ComponentFixture<LoginPage>;
   let mockAuthService: any;
   let router: Router;

   beforeEach(async () => {
      mockAuthService = {
         checkEmailExists: vi.fn()
      };

      await TestBed.configureTestingModule({
         imports: [LoginPage, ReactiveFormsModule],
         providers: [
            provideRouter([]),
            { provide: AuthService, useValue: mockAuthService }
         ]
      }).compileComponents();

      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate');

      fixture = TestBed.createComponent(LoginPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('create the component', () => {
      expect(component).toBeTruthy();
   });

   describe('Positive Scenarios', () => {
      it('have a valid form when correct data is entered', () => {
         component.loginForm.controls['email'].setValue('dummyaccount@gmail.com');
         component.loginForm.controls['password'].setValue('dummy1234!');
         expect(component.loginForm.valid).toBeTruthy();
      });

      it('navigate to dashboard if email exists in the system', () => {
         component.loginForm.controls['email'].setValue('dummyaccount@gmail.com');
         component.loginForm.controls['password'].setValue('dummy1234!');
         mockAuthService.checkEmailExists.mockReturnValue(true);

         component.onSubmit();

         expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
         expect(component.emailNotFound).toBe(false);
      });
   });

   describe('Negative Scenarios', () => {
      it('error when fields blank', () => {
         // Form is initially empty
         expect(component.loginForm.valid).toBeFalsy();
      });

      it('error when email wrong', () => {
         // Invalid format
         component.loginForm.controls['email'].setValue('invalid-email');
         expect(component.loginForm.controls['email'].errors?.['email']).toBeTruthy();
      });

      it('error when password wrong', () => {
         // Password too short
         component.loginForm.controls['password'].setValue('123');
         expect(component.loginForm.controls['password'].errors?.['minlength']).toBeTruthy();
      });

      it('error when using non-exist account', () => {
         // Email not found in AuthService
         component.loginForm.controls['email'].setValue('notfound@gmail.com');
         component.loginForm.controls['password'].setValue('password123');
         mockAuthService.checkEmailExists.mockReturnValue(false);

         component.onSubmit();

         expect(router.navigate).not.toHaveBeenCalled();
         expect(component.emailNotFound).toBe(true);
      });
   });
});
