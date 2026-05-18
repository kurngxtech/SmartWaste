import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { InventoryService } from '../../services/inventory.service';

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

const MOCK_DONATIONS: DonationItem[] = [
   { id: '1', name: 'Fresh Apples', category: 'Fruit', expiryDate: '2026-05-25', pickupLocation: '123 Main St, Springfield', status: 'Available', postedBy: 'John Doe', phoneNumber: '+1 555-0101' },
   { id: '2', name: 'Whole Wheat Bread', category: 'Grain', expiryDate: '2026-05-24', pickupLocation: '456 Elm St, Springfield', status: 'Available', postedBy: 'Jane Smith', phoneNumber: '+1 555-0102' },
   { id: '3', name: 'Canned Beans', category: 'Other', expiryDate: '2027-01-10', pickupLocation: '789 Oak Ave, Springfield', status: 'Available', postedBy: 'Community Center', phoneNumber: '+1 555-0103' },
   { id: '4', name: 'Carrots', category: 'Vegetable', expiryDate: '2026-05-28', pickupLocation: '101 Pine Ln, Springfield', status: 'Available', postedBy: 'Alice Johnson', phoneNumber: '+1 555-0104' },
   { id: '5', name: 'Milk', category: 'Dairy', expiryDate: '2026-05-23', pickupLocation: '202 Cedar Rd, Springfield', status: 'Claimed', postedBy: 'Bob Brown', phoneNumber: '+1 555-0105' },
   { id: '6', name: 'Pasta', category: 'Grain', expiryDate: '2026-10-15', pickupLocation: '303 Birch Blvd, Springfield', status: 'Available', postedBy: 'Carol White', phoneNumber: '+1 555-0106' }
];

@Component({
   selector: 'app-donation-hub-page',
   standalone: true,
   imports: [CommonModule, FormsModule, SideBarNavigation, Header],
   templateUrl: './donation-hub-page.html',
   styleUrl: './donation-hub-page.css'
})
export class DonationHubPage implements OnInit {
   private inventoryService = inject(InventoryService);

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

   ngOnInit() {
      const userDonated = this.inventoryService.items()
         .filter(item => item.status === 'Donated')
         .map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            expiryDate: item.expiryDate,
            pickupLocation: 'Your Address',
            status: 'Available' as const,
            postedBy: 'You',
            phoneNumber: 'Your Phone'
         }));

      this.donations = [
         ...MOCK_DONATIONS,
         ...userDonated
      ].reverse();
      this.filteredDonations = [...this.donations];
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

      item.status = 'Claimed';

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
