import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UserProfile {
   name: string;
   email: string;
   phone: string;
   householdSize: number;
   avatarUrl?: string;
}

export interface UserPreferences {
   expiryAlerts: boolean;
   donationUpdates: boolean;
   weeklySummary: boolean;
   diets: string[];
   twoFactorEnabled: boolean;
   donationVisibility: 'public' | 'private';
   locationPrivacy: 'exact' | 'neighborhood';
   dataAnalyticsOptIn: boolean;
   expiryThreshold: number;
   alertMealReminders: boolean;
   deliveryChannel: 'app' | 'email' | 'both';
   storageLocations: string[];
   pickupLocations: string[];
   preferredCategories: string[];
}

@Injectable({
   providedIn: 'root'
})
export class UserSettingsService {
   private http = inject(HttpClient);

   public profile = signal<UserProfile>(this._loadProfile());
   public preferences = signal<UserPreferences>(this._defaultPreferences());

   constructor() {
      if (typeof window !== 'undefined') {
         // Attempt to load from backend if we already have a token
         if (localStorage.getItem('accessToken')) {
            this.loadFromBackend();
         }
      }
   }

   private _loadProfile(): UserProfile {
      if (typeof window !== 'undefined') {
         const raw = localStorage.getItem('user');
         if (raw) {
            try {
               const u = JSON.parse(raw);
               return {
                  name: u.name || u.username || 'User',
                  email: u.email || '',
                  phone: u.phone || '+60 12-345-6789',
                  householdSize: u.householdSize || 1,
                  avatarUrl: u.avatarUrl || ''
               };
            } catch (_) { /* fall through */ }
         }
      }
      return this._defaultProfile();
   }

   public loadFromBackend() {
      this.http.get<{ success: boolean, data: any }>('/api/auth/profile').subscribe({
         next: (res) => {
            if (res.success && res.data) {
               const u = res.data;
               this.profile.set({
                  name: u.name,
                  email: u.email,
                  phone: u.phone,
                  householdSize: u.householdSize,
                  avatarUrl: u.avatarUrl
               });
               this.preferences.set({
                  expiryAlerts: u.expiryAlerts,
                  donationUpdates: u.donationUpdates,
                  weeklySummary: u.weeklySummary,
                  diets: u.diets,
                  twoFactorEnabled: u.twoFactorEnabled,
                  donationVisibility: u.donationVisibility,
                  locationPrivacy: u.locationPrivacy,
                  dataAnalyticsOptIn: u.dataAnalyticsOptIn,
                  expiryThreshold: u.expiryThreshold,
                  alertMealReminders: u.alertMealReminders,
                  deliveryChannel: u.deliveryChannel,
                  storageLocations: u.storageLocations,
                  pickupLocations: u.pickupLocations,
                  preferredCategories: u.preferredCategories
               });
            }
         },
         error: (err) => console.error('Failed to load user profile from backend', err)
      });
   }

   private _persistToBackend(data: Partial<UserProfile & UserPreferences>) {
      this.http.put<{ success: boolean, data: any }>('/api/auth/profile', data).subscribe({
         next: (res) => {
            if (res.success && res.data) {
               const u = res.data;
               // Update local signals
               this.profile.update(p => ({ ...p, name: u.name, phone: u.phone, householdSize: u.householdSize, avatarUrl: u.avatarUrl }));
               this.preferences.update(p => ({
                  ...p,
                  expiryAlerts: u.expiryAlerts,
                  donationUpdates: u.donationUpdates,
                  weeklySummary: u.weeklySummary,
                  diets: u.diets,
                  twoFactorEnabled: u.twoFactorEnabled,
                  donationVisibility: u.donationVisibility,
                  locationPrivacy: u.locationPrivacy,
                  dataAnalyticsOptIn: u.dataAnalyticsOptIn,
                  expiryThreshold: u.expiryThreshold,
                  alertMealReminders: u.alertMealReminders,
                  deliveryChannel: u.deliveryChannel,
                  storageLocations: u.storageLocations,
                  pickupLocations: u.pickupLocations,
                  preferredCategories: u.preferredCategories
               }));
            }
         },
         error: (err) => console.error('Failed to update user profile in backend', err)
      });
   }

   private _defaultProfile(): UserProfile {
      return { name: 'User', email: '', phone: '+60 12-345-6789', householdSize: 1 };
   }

   private _defaultPreferences(): UserPreferences {
      return {
         expiryAlerts: true,
         donationUpdates: true,
         weeklySummary: false,
         diets: ['Vegetarian', 'Halal'],
         twoFactorEnabled: false,
         donationVisibility: 'public',
         locationPrivacy: 'neighborhood',
         dataAnalyticsOptIn: true,
         expiryThreshold: 3,
         alertMealReminders: false,
         deliveryChannel: 'both',
         storageLocations: ['Main Fridge', 'Pantry', 'Freezer'],
         pickupLocations: ['Home', 'Office'],
         preferredCategories: ['Vegetarian']
      };
   }

   updateProfile(data: Partial<UserProfile>) {
      // Optimistically update local
      this.profile.update(p => ({ ...p, ...data }));
      this._persistToBackend(data);
   }

   updatePreferences(data: Partial<UserPreferences>) {
      this.preferences.update(p => ({ ...p, ...data }));
      this._persistToBackend(data);
   }
   
   toggleDiet(diet: string) {
      const diets = this.preferences().diets.includes(diet)
         ? this.preferences().diets.filter(d => d !== diet)
         : [...this.preferences().diets, diet];
      this.updatePreferences({ diets });
   }
   
   toggleCategory(cat: string) {
      const cats = this.preferences().preferredCategories.includes(cat)
         ? this.preferences().preferredCategories.filter(c => c !== cat)
         : [...this.preferences().preferredCategories, cat];
      this.updatePreferences({ preferredCategories: cats });
   }

   addStorageLocation(loc: string) {
      this.updatePreferences({ storageLocations: [...this.preferences().storageLocations, loc] });
   }

   removeStorageLocation(loc: string) {
      this.updatePreferences({ storageLocations: this.preferences().storageLocations.filter(l => l !== loc) });
   }

   addPickupLocation(loc: string) {
      this.updatePreferences({ pickupLocations: [...this.preferences().pickupLocations, loc] });
   }

   removePickupLocation(loc: string) {
      this.updatePreferences({ pickupLocations: this.preferences().pickupLocations.filter(l => l !== loc) });
   }

   resetSettings() {
      this.profile.set(this._defaultProfile());
      this.preferences.set(this._defaultPreferences());
   }
}
