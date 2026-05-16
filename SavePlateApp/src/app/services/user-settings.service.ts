import { Injectable, signal } from '@angular/core';

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
   public profile = signal<UserProfile>({
      name: 'Bagus Kurniawan',
      email: 'bagusstudy24@gmail.com',
      phone: '+60 12-345-6789',
      householdSize: 3,
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
   });

   public preferences = signal<UserPreferences>({
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
   });

   updateProfile(data: Partial<UserProfile>) {
      this.profile.update(p => ({ ...p, ...data }));
   }

   updatePreferences(data: Partial<UserPreferences>) {
      this.preferences.update(p => ({ ...p, ...data }));
   }
   
   toggleDiet(diet: string) {
       this.preferences.update(p => {
           const diets = p.diets.includes(diet) ? p.diets.filter(d => d !== diet) : [...p.diets, diet];
           return { ...p, diets };
       });
   }
   
   toggleCategory(cat: string) {
       this.preferences.update(p => {
           const cats = p.preferredCategories.includes(cat) ? p.preferredCategories.filter(c => c !== cat) : [...p.preferredCategories, cat];
           return { ...p, preferredCategories: cats };
       });
   }

   addStorageLocation(loc: string) {
      this.preferences.update(p => ({ ...p, storageLocations: [...p.storageLocations, loc] }));
   }

   removeStorageLocation(loc: string) {
      this.preferences.update(p => ({ ...p, storageLocations: p.storageLocations.filter(l => l !== loc) }));
   }

   addPickupLocation(loc: string) {
      this.preferences.update(p => ({ ...p, pickupLocations: [...p.pickupLocations, loc] }));
   }

   removePickupLocation(loc: string) {
      this.preferences.update(p => ({ ...p, pickupLocations: p.pickupLocations.filter(l => l !== loc) }));
   }
}
