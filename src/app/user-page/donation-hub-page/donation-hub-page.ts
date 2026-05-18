import { Component, OnInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { InventoryService } from '../../services/inventory.service';
import { environment } from '../../../environments/environment';

export interface DonationItem {
   id: string;
   name: string;
   category: string;
   expiryDate: string;
   pickupLocation: string;
   status: 'Available' | 'Claimed';
   postedBy: string;
   phoneNumber: string;
}

@Component({
   selector: 'app-donation-hub-page',
   standalone: true,
   imports: [CommonModule, FormsModule, SideBarNavigation, Header],
   templateUrl: './donation-hub-page.html',
   styleUrl: './donation-hub-page.css'
})
export class DonationHubPage implements OnInit {
   private inventoryService = inject(InventoryService);
   private http = inject(HttpClient);

   donations: DonationItem[] = [];
   filteredDonations: DonationItem[] = [];

   // Filter states
   searchTerm = '';
   selectedCategory = 'All';
   selectedExpiry = 'All';

   categories = ['All', 'Fruit', 'Vegetable', 'Dairy', 'Meat', 'Grain', 'Snack', 'Beverage', 'Other'];
   expiryOptions = ['All', 'Expiring in 7 days', 'Expiring in 30 days'];

   // Toast feedback state
   toastMessage: string | null = null;
   toastType: 'success' | 'error' = 'success';
   isLoading = false;

   constructor(
      private cdr: ChangeDetectorRef,
      @Inject(PLATFORM_ID) private platformId: Object
   ) {}

   ngOnInit() {
      if (!isPlatformBrowser(this.platformId)) return;
      this.loadDonationsFromBackend();
   }

   /**
    * Fetch ALL donated items from the backend API (cross-user).
    * This replaces the old approach of reading from local inventory signal.
    */
   loadDonationsFromBackend() {
      this.isLoading = true;
      this.http.get<any>(`${environment.apiUrl}/donations?_t=${Date.now()}`).subscribe({
         next: (res) => {
            this.isLoading = false;
            if (res.success && res.data) {
               this.donations = res.data.map((item: any) => ({
                  id: item._id,
                  name: item.name,
                  category: item.category,
                  expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
                  pickupLocation: item.notes || 'Contact donor',
                  status: 'Available' as const,
                  postedBy: item.userId?.name || 'Anonymous',
                  phoneNumber: 'Contact via app'
               }));
               this.filteredDonations = [...this.donations];
               this.cdr.detectChanges();
            }
         },
         error: (err) => {
            this.isLoading = false;
            this.cdr.detectChanges();
            console.error('Failed to load donations from backend', err);
         }
      });
   }

   applyFilters() {
      this.filteredDonations = this.donations.filter(item => {
         const matchSearch = !this.searchTerm ||
            item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            item.pickupLocation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(this.searchTerm.toLowerCase());

         const matchCategory = this.selectedCategory === 'All' || item.category === this.selectedCategory;

         let matchExpiry = true;
         if (this.selectedExpiry !== 'All') {
            const expDate = new Date(item.expiryDate);
            const today = new Date();
            const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

            if (this.selectedExpiry === 'Expiring in 7 days') {
               matchExpiry = diffDays <= 7;
            } else if (this.selectedExpiry === 'Expiring in 30 days') {
               matchExpiry = diffDays <= 30;
            }
         }

         return matchSearch && matchCategory && matchExpiry;
      }).reverse();
   }

   claimDonation(item: DonationItem) {
      if (item.status === 'Claimed') return;

      this.http.post<any>(`${environment.apiUrl}/donations/${item.id}/claim`, {}).subscribe({
         next: (res) => {
            if (res.success) {
               item.status = 'Claimed';

               // Also add the claimed item to the current user's local inventory
               this.inventoryService.addItem({
                  name: item.name,
                  category: item.category,
                  quantity: 1,
                  expiryDate: item.expiryDate,
                  location: 'Fridge',
                  status: 'Good',
                  note: `Claimed from ${item.postedBy}`,
                  isClaimed: true
               }).subscribe();

               this.showToast(`Successfully claimed ${item.name}! Added to your inventory.`, 'success');
            }
         },
         error: (err) => {
            const msg = err.error?.message || 'Failed to claim donation';
            this.showToast(msg, 'error');
         }
      });
   }

   cancelDonation(item: DonationItem) {
      const invItem = this.inventoryService.getItemById(item.id);
      if (invItem) {
         this.inventoryService.updateItem(invItem.id, { status: 'Good' }).subscribe();
      }
      this.donations = this.donations.filter(d => d.id !== item.id);
      this.applyFilters();
      this.showToast(`Donation cancelled. Item returned to inventory.`, 'success');
   }

   showToast(message: string, type: 'success' | 'error') {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => {
         this.toastMessage = null;
      }, 4000);
   }

   getStatusClass(status: string) {
      return status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700';
   }
}
