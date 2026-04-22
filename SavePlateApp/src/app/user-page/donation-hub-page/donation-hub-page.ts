import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';

export interface DonationItem {
   id: string;
   name: string;
   category: string;
   expiryDate: string;
   pickupLocation: string;
   status: 'Available' | 'Claimed';
   postedBy: string;
}

@Component({
   selector: 'app-donation-hub-page',
   standalone: true,
   imports: [CommonModule, FormsModule, SideBarNavigation, Header],
   templateUrl: './donation-hub-page.html',
   styleUrl: './donation-hub-page.css'
})
export class DonationHubPage implements OnInit {
   donations: DonationItem[] = [
      { id: '1', name: 'Fresh Apples', category: 'Fruits', expiryDate: '2026-04-25', pickupLocation: '123 Main St, Springfield', status: 'Available', postedBy: 'John Doe' },
      { id: '2', name: 'Whole Wheat Bread', category: 'Bakery', expiryDate: '2026-04-24', pickupLocation: '456 Elm St, Springfield', status: 'Available', postedBy: 'Jane Smith' },
      { id: '3', name: 'Canned Beans', category: 'Pantry', expiryDate: '2027-01-10', pickupLocation: '789 Oak Ave, Springfield', status: 'Available', postedBy: 'Community Center' },
      { id: '4', name: 'Carrots', category: 'Vegetables', expiryDate: '2026-04-28', pickupLocation: '101 Pine Ln, Springfield', status: 'Available', postedBy: 'Alice Johnson' },
      { id: '5', name: 'Milk', category: 'Dairy', expiryDate: '2026-04-23', pickupLocation: '202 Cedar Rd, Springfield', status: 'Claimed', postedBy: 'Bob Brown' },
      { id: '6', name: 'Pasta', category: 'Pantry', expiryDate: '2026-10-15', pickupLocation: '303 Birch Blvd, Springfield', status: 'Available', postedBy: 'Carol White' }
   ];

   filteredDonations: DonationItem[] = [];

   // Filter states
   searchTerm = '';
   selectedCategory = 'All';
   selectedExpiry = 'All';

   categories = ['All', 'Fruits', 'Vegetables', 'Bakery', 'Pantry', 'Dairy', 'Meat', 'Other'];
   expiryOptions = ['All', 'Expiring in 7 days', 'Expiring in 30 days'];

   // Toast feedback state
   toastMessage: string | null = null;
   toastType: 'success' | 'error' = 'success';

   ngOnInit() {
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
            const today = new Date('2026-04-20');
            const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

            if (this.selectedExpiry === 'Expiring in 7 days') {
               matchExpiry = diffDays <= 7;
            } else if (this.selectedExpiry === 'Expiring in 30 days') {
               matchExpiry = diffDays <= 30;
            }
         }

         return matchSearch && matchCategory && matchExpiry;
      });
   }

   claimDonation(item: DonationItem) {
      if (item.status === 'Claimed') return;

      // Simulate backend update
      item.status = 'Claimed';

      // Show toast
      this.showToast(`Successfully claimed ${item.name}! Please arrange pickup soon.`, 'success');
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
