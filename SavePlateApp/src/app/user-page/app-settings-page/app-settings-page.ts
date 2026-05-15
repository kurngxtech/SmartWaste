import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';

@Component({
   selector: 'app-app-settings-page',
   standalone: true,
   imports: [CommonModule, FormsModule, RouterLink, SideBarNavigation, Header],
   templateUrl: './app-settings-page.html',
   styleUrl: './app-settings-page.css',
})
export class AppSettingsPage {

   // ── Active Section Tab ──────────────────────────────────────────────
   activeTab = signal<string>('privacy');

   setTab(tab: string) {
      this.activeTab.set(tab);
   }

   // ── Privacy & Security ──────────────────────────────────────────────
   twoFactorEnabled = signal<boolean>(false);
   donationVisibility = signal<'public' | 'private'>('public');
   locationPrivacy = signal<'exact' | 'neighborhood'>('neighborhood');
   dataAnalyticsOptIn = signal<boolean>(true);

   toggleTwoFactor() {
      this.twoFactorEnabled.set(!this.twoFactorEnabled());
   }
   toggleDataAnalytics() {
      this.dataAnalyticsOptIn.set(!this.dataAnalyticsOptIn());
   }

   // ── Notification Preferences ────────────────────────────────────────
   expiryThreshold = signal<number>(3);
   alertInventoryExpiry = signal<boolean>(true);
   alertDonationUpdates = signal<boolean>(true);
   alertMealReminders = signal<boolean>(false);
   deliveryChannel = signal<'app' | 'email' | 'both'>('both');

   // ── Account & Household ─────────────────────────────────────────────
   householdSize = signal<number>(3);
   storageLocations = signal<string[]>(['Main Fridge', 'Pantry', 'Freezer']);
   newStorageLocation = '';

   addStorageLocation() {
      const trimmed = this.newStorageLocation.trim();
      if (trimmed && !this.storageLocations().includes(trimmed)) {
         this.storageLocations.update(locs => [...locs, trimmed]);
      }
      this.newStorageLocation = '';
   }

   removeStorageLocation(loc: string) {
      this.storageLocations.update(locs => locs.filter(l => l !== loc));
   }

   // ── Donation & Community ────────────────────────────────────────────
   pickupLocations = signal<string[]>(['Home', 'Office']);
   newPickupLocation = '';
   preferredCategories = signal<string[]>(['Vegetarian']);

   allCategories = ['Vegetarian', 'Vegan', 'Canned Goods', 'Dairy', 'Bakery', 'Fruits & Veg', 'Meat & Poultry', 'Snacks', 'Beverages'];

   addPickupLocation() {
      const trimmed = this.newPickupLocation.trim();
      if (trimmed && !this.pickupLocations().includes(trimmed)) {
         this.pickupLocations.update(locs => [...locs, trimmed]);
      }
      this.newPickupLocation = '';
   }

   removePickupLocation(loc: string) {
      this.pickupLocations.update(locs => locs.filter(l => l !== loc));
   }

   toggleCategory(cat: string) {
      const current = this.preferredCategories();
      if (current.includes(cat)) {
         this.preferredCategories.set(current.filter(c => c !== cat));
      } else {
         this.preferredCategories.set([...current, cat]);
      }
   }

   // ── Save / Toast ────────────────────────────────────────────────────
   showToast = signal<boolean>(false);

   saveSettings() {
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
   }
}
