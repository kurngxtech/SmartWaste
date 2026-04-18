import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('AuthService', () => {
   let service: AuthService;

   beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(AuthService);

      // Spy on console.log to avoid cluttering test output
      vi.spyOn(console, 'log').mockImplementation(() => { });
   });

   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('should be created', () => {
      expect(service).toBeTruthy();
   });

   describe('sendVerificationEmail', () => {
      it('should return false if email does not end with @gmail.com', () => {
         const user = { email: 'test@yahoo.com', fullName: 'Test User' };
         const result = service.sendVerificationEmail(user);

         expect(result).toBe(false);
         // Accessing private property using bracket notation for testing purposes
         expect((service as any).pendingRegistrations.has(user.email)).toBe(false);
      });

      it('should return true and generate a 6-digit code for @gmail.com emails', () => {
         const user = { email: 'test@gmail.com', fullName: 'Test User' };

         // Spy on Math.random to control the generated code
         vi.spyOn(Math, 'random').mockReturnValue(0.123456); // 0.123456 * 900000 = 111110.4 + 100000 = 211110

         const result = service.sendVerificationEmail(user);

         expect(result).toBe(true);

         const pendingMap = (service as any).pendingRegistrations;
         expect(pendingMap.has(user.email)).toBe(true);
         expect(pendingMap.get(user.email).code).toBe('211110');
         expect(pendingMap.get(user.email).user).toEqual(user);
         expect(console.log).toHaveBeenCalled();
      });

      it('should handle case-insensitive @gmail.com emails', () => {
         const user = { email: 'TEST@GMAIL.COM', fullName: 'Test User' };
         const result = service.sendVerificationEmail(user);

         expect(result).toBe(true);
         expect((service as any).pendingRegistrations.has(user.email)).toBe(true);
      });
   });

   describe('verifyCodeAndRegister', () => {
      const mockUser = { email: 'test@gmail.com', fullName: 'Test User' };
      const mockCode = '123456';

      beforeEach(() => {
         // Manually set a pending registration
         (service as any).pendingRegistrations.set(mockUser.email, { user: mockUser, code: mockCode });
      });

      it('should return true and register user if code is correct', () => {
         const result = service.verifyCodeAndRegister(mockUser.email, mockCode);

         expect(result).toBe(true);
         expect((service as any).pendingRegistrations.has(mockUser.email)).toBe(false); // Should be deleted
         expect((service as any).users).toContain(mockUser); // Should be added to users
         expect(console.log).toHaveBeenCalledWith('User registered successfully:', mockUser);
      });

      it('should return false if code is incorrect', () => {
         const result = service.verifyCodeAndRegister(mockUser.email, '000000');

         expect(result).toBe(false);
         expect((service as any).pendingRegistrations.has(mockUser.email)).toBe(true); // Should NOT be deleted
         expect((service as any).users).not.toContain(mockUser); // Should NOT be added
      });

      it('should return false if email has no pending registration', () => {
         const result = service.verifyCodeAndRegister('unknown@gmail.com', mockCode);

         expect(result).toBe(false);
      });
   });

   describe('register', () => {
      it('should add user directly to the users array', () => {
         const user = { email: 'direct@gmail.com', fullName: 'Direct User' };

         service.register(user);

         expect((service as any).users).toContain(user);
         expect(console.log).toHaveBeenCalledWith('User registered:', user);
      });
   });

   describe('checkEmailExists', () => {
      it('should return true if email exists in registered users', () => {
         const user = { email: 'exists@gmail.com', fullName: 'Existing User' };
         (service as any).users.push(user);

         expect(service.checkEmailExists('exists@gmail.com')).toBe(true);
      });

      it('should return false if email does not exist in registered users', () => {
         expect(service.checkEmailExists('notfound@gmail.com')).toBe(false);
      });
   });
});
