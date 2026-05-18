import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserSettingsService } from '../services/user-settings.service';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private http = inject(HttpClient);
   private userSettingsService = inject(UserSettingsService);

   constructor() { }

   // Register (sends verification email)
   register(userData: any): Observable<any> {
      // API expects name instead of fullName, so we map it here
      const payload = {
         name: userData.fullName,
         email: userData.email,
         password: userData.password,
         householdSize: userData.householdSize,
         phone: userData.phone
      };
      return this.http.post(`${environment.apiUrl}/auth/register`, payload);
   }

   // Verify code
   verifyEmail(email: string, code: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/verify-email`, { email, code });
   }

   // Login — may return requiresTwoFactor if 2FA is enabled
   login(credentials: any): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/login`, credentials).pipe(
         tap((response: any) => {
            if (response.success && !response.requiresTwoFactor) {
               this._storeSession(response);
            }
            // If requiresTwoFactor is true, we don't store tokens yet —
            // the user must complete 2FA verification first.
         })
      );
   }

   // Verify 2FA code after login
   verify2FA(email: string, code: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/verify-2fa`, { email, code }).pipe(
         tap((response: any) => {
            if (response.success) {
               this._storeSession(response);
            }
         })
      );
   }

   // Toggle 2FA on/off (requires auth)
   toggle2FA(enabled: boolean): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/toggle-2fa`, { enabled });
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
         })
      );
   }
}