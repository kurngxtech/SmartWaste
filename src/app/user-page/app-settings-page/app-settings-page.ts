import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { UserSettingsService } from '../../services/user-settings.service';
import { AuthService } from '../../authentication/auth.service';

@Component({
   selector: 'app-app-settings-page',
   standalone: true,
   imports: [CommonModule, FormsModule, SideBarNavigation, Header],
   templateUrl: './app-settings-page.html',
   styleUrl: './app-settings-page.css',
})
export class AppSettingsPage {
   settingsService = inject(UserSettingsService);
   private authService = inject(AuthService);

   // ── Active Section Tab ──────────────────────────────────────────────
   activeTab = signal<string>('privacy');

   setTab(tab: string) {
      this.activeTab.set(tab);
   }

   // Getters for template
   get profile() { return this.settingsService.profile(); }
   get preferences() { return this.settingsService.preferences(); }

   // ── Privacy & Security ──────────────────────────────────────────────
   get twoFactorEnabled() { return this.preferences.twoFactorEnabled; }
   get donationVisibility() { return this.preferences.donationVisibility; }
   get locationPrivacy() { return this.preferences.locationPrivacy; }
   get dataAnalyticsOptIn() { return this.preferences.dataAnalyticsOptIn; }

   toggleTwoFactor() {
      const newState = !this.twoFactorEnabled;
      // Persist to backend (MongoDB User model)
      this.authService.toggle2FA(newState).subscribe({
         next: () => {
            this.settingsService.updatePreferences({ twoFactorEnabled: newState });
         },
         error: (err) => {
            console.error('Failed to toggle 2FA on backend', err);
            // Still update locally as fallback
            this.settingsService.updatePreferences({ twoFactorEnabled: newState });
         }
      });
   }
   toggleDataAnalytics() {
      this.settingsService.updatePreferences({ dataAnalyticsOptIn: !this.dataAnalyticsOptIn });
   }
   setDonationVisibility(v: 'public' | 'private') {
      this.settingsService.updatePreferences({ donationVisibility: v });
   }
   setLocationPrivacy(v: 'exact' | 'neighborhood') {
      this.settingsService.updatePreferences({ locationPrivacy: v });
   }

   // ── Notification Preferences ────────────────────────────────────────
   get expiryThreshold() { return this.preferences.expiryThreshold; }
   get alertInventoryExpiry() { return this.preferences.expiryAlerts; }
   get alertDonationUpdates() { return this.preferences.donationUpdates; }
   get alertMealReminders() { return this.preferences.alertMealReminders; }
   get deliveryChannel() { return this.preferences.deliveryChannel; }

   setExpiryThreshold(v: number) { this.settingsService.updatePreferences({ expiryThreshold: v }); }
   toggleAlertInventoryExpiry() { this.settingsService.updatePreferences({ expiryAlerts: !this.alertInventoryExpiry }); }
   toggleAlertDonationUpdates() { this.settingsService.updatePreferences({ donationUpdates: !this.alertDonationUpdates }); }
   toggleAlertMealReminders() { this.settingsService.updatePreferences({ alertMealReminders: !this.alertMealReminders }); }
   setDeliveryChannel(v: 'app' | 'email' | 'both') { this.settingsService.updatePreferences({ deliveryChannel: v }); }

   // ── Account & Household ─────────────────────────────────────────────
   get householdSize() { return this.profile.householdSize; }
   get storageLocations() { return this.preferences.storageLocations; }
   newStorageLocation = '';

   setHouseholdSize(v: number) {
      this.settingsService.updateProfile({ householdSize: v });
   }

   addStorageLocation() {
      const trimmed = this.newStorageLocation.trim();
      if (trimmed && !this.storageLocations.includes(trimmed)) {
         this.settingsService.addStorageLocation(trimmed);
      }
      this.newStorageLocation = '';
   }

   removeStorageLocation(loc: string) {
      this.settingsService.removeStorageLocation(loc);
   }

   // ── Donation & Community ────────────────────────────────────────────
   get pickupLocations() { return this.preferences.pickupLocations; }
   newPickupLocation = '';
   get preferredCategories() { return this.preferences.preferredCategories; }

   allCategories = ['Vegetarian', 'Vegan', 'Canned Goods', 'Dairy', 'Bakery', 'Fruits & Veg', 'Meat & Poultry', 'Snacks', 'Beverages'];

   addPickupLocation() {
      const trimmed = this.newPickupLocation.trim();
      if (trimmed && !this.pickupLocations.includes(trimmed)) {
         this.settingsService.addPickupLocation(trimmed);
      }
      this.newPickupLocation = '';
   }

   removePickupLocation(loc: string) {
      this.settingsService.removePickupLocation(loc);
   }

   toggleCategory(cat: string) {
      this.settingsService.toggleCategory(cat);
   }

   // ── Save / Toast ────────────────────────────────────────────────────
   showToast = signal<boolean>(false);

   saveSettings() {
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
   }
}
