import { Component, OnInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { InventoryService } from '../../services/inventory.service';
import { UserSettingsService } from '../../services/user-settings.service';
import { environment } from '../../../environments/environment';

export interface ClaimRequester {
   id: string;
   name: string;
   phone: string;
   email: string;
   message: string;
   requestedAt: string;
   status: string;
}

export interface DonationItem {
   id: string;
   name: string;
   category: string;
   quantity: number;
   expiryDate: string;
   pickupLocation: string;
   pickupDate: string;
   pickupTime: string;
   status: 'Available' | 'Claimed';
   postedBy: string;
   phoneNumber: string;
   isOwner: boolean;
   claimRequestCount: number;
   ownerUserId: string;
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
   private userSettings = inject(UserSettingsService);
   private http = inject(HttpClient);
   private cdr = inject(ChangeDetectorRef);

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

   // View Requests Modal state
   showRequestsModal = false;
   requestsModalItem: DonationItem | null = null;
   claimRequesters: ClaimRequester[] = [];
   isLoadingRequests = false;
   confirmingRequestId: string | null = null;

   // Current user ID for ownership check
   currentUserId = '';

   constructor(
      @Inject(PLATFORM_ID) private platformId: Object
   ) {}

   ngOnInit() {
      // Only load data in the browser — SSR has no auth token
      if (!isPlatformBrowser(this.platformId)) return;

      this.currentUserId = this.extractUserIdFromToken();
      this.loadDonationsFromBackend();
   }

   /**
    * Extract userId from the JWT stored in localStorage.
    */
   private extractUserIdFromToken(): string {
      try {
         const token = localStorage.getItem('accessToken');
         if (!token) return '';
         const payload = JSON.parse(atob(token.split('.')[1]));
         return payload.userId || payload.id || '';
      } catch {
         return '';
      }
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
               this.donations = res.data.map((item: any) => {
                  // Format pickup date
                  let pickupDateStr = '';
                  if (item.pickupDate) {
                     const d = new Date(item.pickupDate);
                     pickupDateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  }

                  const ownerUserId = item.ownerUserId || item.userId?._id || '';

                  return {
                     id: item._id,
                     name: item.name,
                     category: item.category,
                     quantity: item.donationQuantity || item.quantity || 1,
                     expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
                     pickupLocation: item.pickupLocation || item.notes || 'Contact donor',
                     pickupDate: pickupDateStr,
                     pickupTime: item.pickupTime || '',
                     status: (item.status === 'claimed' ? 'Claimed' : 'Available') as 'Available' | 'Claimed',
                     postedBy: item.userId?.name || 'Anonymous',
                     phoneNumber: item.contactPhone || item.userId?.phone || 'Contact via app',
                     isOwner: ownerUserId === this.currentUserId,
                     claimRequestCount: item.claimRequestCount || 0,
                     ownerUserId: ownerUserId
                  };
               });
               this.filteredDonations = [...this.donations];
            }
            this.cdr.detectChanges();
         },
         error: (err) => {
            this.isLoading = false;
            console.error('Failed to load donations from backend', err);
            this.cdr.detectChanges();
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

   /**
    * Request to claim a donation (for non-owners).
    */
   requestClaim(item: DonationItem) {
      if (item.status === 'Claimed' || item.isOwner) return;

      this.http.post<any>(`${environment.apiUrl}/donations/${item.id}/request`, {}).subscribe({
         next: (res) => {
            if (res.success) {
               item.claimRequestCount++;
               this.showToast(`Claim request submitted for ${item.name}! The donor will review your request.`, 'success');
            }
         },
         error: (err) => {
            const msg = err.error?.message || 'Failed to submit claim request';
            this.showToast(msg, 'error');
         }
      });
   }

   /**
    * Legacy direct claim (kept for backwards compat).
    */
   claimDonation(item: DonationItem) {
      if (item.status === 'Claimed') return;

      this.http.post<any>(`${environment.apiUrl}/donations/${item.id}/claim`, {}).subscribe({
         next: (res) => {
            if (res.success) {
               this.showToast(`Successfully claimed ${item.name}! Added to your inventory.`, 'success');
               this.loadDonationsFromBackend();

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
            }
         },
         error: (err) => {
            const msg = err.error?.message || 'Failed to claim donation';
            this.showToast(msg, 'error');
         }
      });
   }

   /**
    * Cancel a donation (only for the owner).
    */
   cancelDonation(item: DonationItem) {
      this.http.post<any>(`${environment.apiUrl}/donations/${item.id}/cancel`, {}).subscribe({
         next: (res) => {
            if (res.success) {
               this.showToast(`Donation cancelled. Item returned to inventory.`, 'success');
               this.loadDonationsFromBackend();
               this.inventoryService.loadItems().subscribe();
            }
         },
         error: (err) => {
            const msg = err.error?.message || 'Failed to cancel donation';
            this.showToast(msg, 'error');
         }
      });
   }

   /**
    * Open the "View Requests" modal for a donation.
    */
   openRequestsModal(item: DonationItem) {
      this.requestsModalItem = item;
      this.showRequestsModal = true;
      this.claimRequesters = [];
      this.isLoadingRequests = true;
      this.confirmingRequestId = null;

      this.http.get<any>(`${environment.apiUrl}/donations/${item.id}/requests`).subscribe({
         next: (res) => {
            this.isLoadingRequests = false;
            if (res.success && res.data) {
               this.claimRequesters = res.data.map((r: any) => ({
                  id: r._id,
                  name: r.requesterId?.name || 'Unknown',
                  phone: r.requesterId?.phone || 'N/A',
                  email: r.requesterId?.email || 'N/A',
                  message: r.message || '',
                  requestedAt: new Date(r.createdAt).toLocaleDateString('en-GB', {
                     day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }),
                  status: r.status
               }));
            }
            this.cdr.detectChanges();
         },
         error: () => {
            this.isLoadingRequests = false;
            this.showToast('Failed to load claim requests', 'error');
         }
      });
   }

   closeRequestsModal() {
      this.showRequestsModal = false;
      this.requestsModalItem = null;
      this.claimRequesters = [];
   }

   /**
    * Confirm a specific claim request.
    */
   confirmRequest(requester: ClaimRequester) {
      if (!this.requestsModalItem) return;
      this.confirmingRequestId = requester.id;

      this.http.post<any>(
         `${environment.apiUrl}/donations/${this.requestsModalItem.id}/requests/${requester.id}/confirm`, {}
      ).subscribe({
         next: (res) => {
            this.confirmingRequestId = null;
            if (res.success) {
               this.closeRequestsModal();
               this.showToast(`Confirmed ${requester.name}'s claim request! They will be notified.`, 'success');
               this.loadDonationsFromBackend();
            }
         },
         error: (err) => {
            this.confirmingRequestId = null;
            const msg = err.error?.message || 'Failed to confirm request';
            this.showToast(msg, 'error');
         }
      });
   }

   showToast(message: string, type: 'success' | 'error') {
      this.toastMessage = message;
      this.toastType = type;
      this.cdr.detectChanges();
      setTimeout(() => {
         this.toastMessage = null;
         this.cdr.detectChanges();
      }, 4000);
   }

   getStatusClass(status: string) {
      return status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700';
   }
}
