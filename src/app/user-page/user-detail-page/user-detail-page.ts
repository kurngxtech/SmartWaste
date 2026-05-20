import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { UserSettingsService } from '../../services/user-settings.service';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { MealPlannerService } from '../../services/meal-planner';
import { AuthService } from '../../authentication/auth.service';

@Component({
   selector: 'app-user-detail-page',
   standalone: true,
   imports: [CommonModule, FormsModule, SideBarNavigation, Header],
   templateUrl: './user-detail-page.html'
})
export class UserDetailPage {
   settingsService = inject(UserSettingsService);
   private router = inject(Router);
   private inventoryService = inject(InventoryService);
   private mealPlannerService = inject(MealPlannerService);
   private authService = inject(AuthService);

   showToast = signal(false);
   isUploadingAvatar = signal(false);
   isPreviewOpen = signal(false);
   showLogoutModal = signal(false);
   showDeleteModal1 = signal(false);
   showDeleteModal2 = signal(false);

   openPreview() { this.isPreviewOpen.set(true); }
   closePreview() { this.isPreviewOpen.set(false); }

   openLogoutConfirm() { this.showLogoutModal.set(true); }
   closeLogoutConfirm() { this.showLogoutModal.set(false); }

   confirmLogout() {
      this.authService.logout().subscribe({
         next: () => {
            this.closeLogoutConfirm();
            this.router.navigate(['/login']);
         },
         error: () => {
            // Even on error, clear local storage and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userPreferences');
            this.closeLogoutConfirm();
            this.router.navigate(['/login']);
         }
      });
   }

   openDeleteConfirm() { this.showDeleteModal1.set(true); }
   closeDeleteConfirm() { 
      this.showDeleteModal1.set(false); 
      this.showDeleteModal2.set(false);
   }
   
   proceedToDelete2() {
      this.showDeleteModal1.set(false);
      this.showDeleteModal2.set(true);
   }

   confirmDelete() {
      this.authService.deleteAccount().subscribe({
         next: () => {
            this.inventoryService.clearLocalItems();
            this.mealPlannerService.clearPlans();
            this.settingsService.resetSettings();
            this.closeDeleteConfirm();
            this.router.navigate(['/login']);
         },
         error: (err) => {
            console.error('Failed to delete account', err);
            // Fallback clear
            this.inventoryService.clearLocalItems();
            this.mealPlannerService.clearPlans();
            this.settingsService.resetSettings();
            this.closeDeleteConfirm();
            this.router.navigate(['/login']);
         }
      });
   }

   saveChanges() {
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
   }

   get profile() { return this.settingsService.profile(); }
   get preferences() { return this.settingsService.preferences(); }

   updateName(val: string) { this.settingsService.updateProfile({ name: val }); }
   updateEmail(val: string) { this.settingsService.updateProfile({ email: val }); }
   updatePhone(val: string) { this.settingsService.updateProfile({ phone: val }); }
   updateHouseholdSize(val: number) { this.settingsService.updateProfile({ householdSize: val }); }

   updateExpiryAlerts(val: boolean) { this.settingsService.updatePreferences({ expiryAlerts: val }); }
   updateDonationUpdates(val: boolean) { this.settingsService.updatePreferences({ donationUpdates: val }); }
   updateWeeklySummary(val: boolean) { this.settingsService.updatePreferences({ weeklySummary: val }); }

   toggleDiet(diet: string) { this.settingsService.toggleDiet(diet); }
   
   get availableDiets() { return ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut-Free']; }

   onFileSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
         const file = input.files[0];
         this.isUploadingAvatar.set(true);

         const reader = new FileReader();
         reader.onload = (e: any) => {
            setTimeout(() => {
               this.settingsService.updateProfile({ avatarUrl: e.target.result });
               this.isUploadingAvatar.set(false);
               this.showToast.set(true);
               setTimeout(() => this.showToast.set(false), 3000);
            }, 1200);
         };
         reader.readAsDataURL(file);
      }
   }
}