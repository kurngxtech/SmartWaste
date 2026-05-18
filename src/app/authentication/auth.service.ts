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

   // Login
   login(credentials: any): Observable<any> {
      return this.http.post(`${environment.apiUrl}/auth/login`, credentials).pipe(
         tap((response: any) => {
            if (response.success) {
               // Store tokens
               localStorage.setItem('accessToken', response.accessToken);
               localStorage.setItem('refreshToken', response.refreshToken);
               // Store user data
               localStorage.setItem('user', JSON.stringify(response.user));
               
               // Update the user settings service state
               this.userSettingsService.updateProfile({ 
                  name: response.user.name, 
                  email: response.user.email, 
                  householdSize: response.user.householdSize || 2, 
                  phone: response.user.phone || '' 
               });
            }
         })
      );
   }

   // Logout
   logout(): Observable<any> {
      const refreshToken = localStorage.getItem('refreshToken');
      return this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).pipe(
         tap(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
         })
      );
   }
}