import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserSettingsService } from '../services/user-settings.service';
import { MealPlannerService } from '../services/meal-planner';
import { NotificationService } from '../services/notification.service';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private http = inject(HttpClient);
   private userSettingsService = inject(UserSettingsService);
   private mealPlannerService = inject(MealPlannerService);
   private notificationService = inject(NotificationService);

   constructor() { }

   // Register (sends verification OTP email)
   register(userData: any): Observable<any> {
      const payload = {
         name: userData.fullName,
         email: userData.email,
         password: userData.password,
         householdSize: userData.householdSize,
         phone: userData.phone
      };
      return this.http.post(`${environment.apiUrl}/auth/register`, payload);
   }

   // Verify signup OTP code
   verifyEmail(email: string, code: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/verify-email`, { email, code });
   }

   // Resend signup OTP (recovery path when email delivery failed)
   resendVerification(email: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/resend-verification`, { email });
   }

   // Login — may return requiresTwoFactor if 2FA is enabled
   login(credentials: any): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/login`, credentials).pipe(
         tap((response: any) => {
            if (response.success && !response.requiresTwoFactor) {
               this._storeSession(response);
            }
            // If requiresTwoFactor is true, tokens are NOT stored yet —
            // the user must complete 2FA verification first.
         })
      );
   }

   // Verify 2FA OTP after login
   verify2FA(email: string, code: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/verify-2fa`, { email, code }).pipe(
         tap((response: any) => {
            if (response.success) {
               this._storeSession(response);
            }
         })
      );
   }

   // Resend login 2FA OTP (recovery path)
   resend2FA(email: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/resend-2fa`, { email });
   }

   // Toggle 2FA on/off (requires auth)
   toggle2FA(enabled: boolean): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/toggle-2fa`, { enabled });
   }

   // Request a password reset email
   forgotPassword(email: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
   }

   // Submit new password using the token from the reset link
   resetPassword(token: string, email: string, newPassword: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/reset-password`, { token, email, newPassword });
   }

   // Store session data (tokens + user profile)
   private _storeSession(response: any) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Optimistically update the user settings profile from the login response
      this.userSettingsService.profile.update(p => ({
         ...p,
         name: response.user.name,
         email: response.user.email,
         phone: response.user.phone || p.phone,
         householdSize: response.user.householdSize || p.householdSize,
         avatarUrl: response.user.avatarUrl || p.avatarUrl
      }));

      // Fetch full settings and preferences from backend
      this.userSettingsService.loadFromBackend();

      // Reload meal plans scoped to the newly logged-in user
      // (prevents stale plans from a previous session showing up)
      this.mealPlannerService.loadPlans();
   }

   // Logout
   logout(): Observable<any> {
      const refreshToken = localStorage.getItem('refreshToken');
      return this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).pipe(
         tap(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userPreferences');

            // Clear per-user in-memory state to prevent cross-user data leakage
            this.mealPlannerService.clearPlans();
            // Reset dismissed notification IDs so the next session starts clean
            this.notificationService.resetDismissed();
         })
      );
   }

   // Delete account
   deleteAccount(): Observable<any> {
      return this.http.delete(`${environment.apiUrl}/auth/profile`).pipe(
         tap(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userPreferences');

            // Clear per-user in-memory state to prevent cross-user data leakage
            this.mealPlannerService.clearPlans();
         })
      );
   }
}