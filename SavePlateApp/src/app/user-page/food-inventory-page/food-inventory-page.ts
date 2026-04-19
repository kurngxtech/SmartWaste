import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';

export interface InventoryItem {
   id: string;
   name: string;
   category: string;
   quantity: number;
   expiryDate: string;
   location: string;
   status: string;
   note: string;
   daysLeft?: number;
}

@Component({
   selector: 'app-food-inventory-page',
   standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SideBarNavigation, Header],
   templateUrl: './food-inventory-page.html'
})
export class FoodInventoryPageComponent implements OnInit {
   items: InventoryItem[] = [
      { id: '1', name: 'Spinach', category: 'Vegetable', quantity: 2, expiryDate: '2026-04-22', location: 'Fridge', status: '', note: 'Organic' },
      { id: '2', name: 'Milk', category: 'Dairy', quantity: 1, expiryDate: '2026-04-19', location: 'Fridge', status: '', note: '-' },
      { id: '3', name: 'Rice', category: 'Grain', quantity: 5, expiryDate: '2026-12-01', location: 'Pantry', status: '', note: 'Jasmine rice' },
      { id: '4', name: 'Chicken Breast', category: 'Meat', quantity: 3, expiryDate: '2026-04-25', location: 'Freezer', status: '', note: '-' },
      { id: '5', name: 'Apple', category: 'Fruit', quantity: 6, expiryDate: '2026-05-10', location: 'Fridge', status: '', note: '-' },
      { id: '6', name: 'Pork Belly', category: 'Meat', quantity: 1, expiryDate: '2026-04-25', location: 'Freezer', status: '', note: '-' }
   ];

   filteredItems: InventoryItem[] = [];

   // Summary counts
   totalItems = 0;
   expiringSoonCount = 0;
   expiredCount = 0;
   donatedCount = 0;

   // Filters
   searchTerm = '';
   selectedCategory = 'All';
   selectedLocation = 'All';
   selectedStatus = 'All';

   categories = ['All', 'Vegetable', 'Fruit', 'Dairy', 'Meat', 'Grain', 'Snack', 'Beverage', 'Other'];
   locations = ['All', 'Fridge', 'Pantry', 'Freezer'];
   statuses = ['All', 'Good', 'Expiring soon', 'Expired', 'Donated'];

   // Modals
   showAddModal = false;
   showDonateModal = false;
   showDeleteModal = false;

   itemToDonate: InventoryItem | null = null;
   itemToDelete: InventoryItem | null = null;

   addForm: FormGroup;
   donateForm: FormGroup;

   today = new Date('2026-04-20T00:00:00'); // Fixed for simulation matching prompt

   constructor(private fb: FormBuilder) {
      this.addForm = this.fb.group({
         name: ['', Validators.required],
         category: ['Vegetable', Validators.required],
         location: ['Fridge', Validators.required],
         quantity: [1, [Validators.required, Validators.min(1)]],
         expiryDate: ['', Validators.required],
         note: ['']
      });

      this.donateForm = this.fb.group({
         pickupAvailability: ['', Validators.required],
         note: ['']
      });
   }

   ngOnInit() {
      this.updateItemStatuses();
      this.applyFilters();
   }

   updateItemStatuses() {
      this.items.forEach(item => {
         if (item.status === 'Donated') return;

         const expDate = new Date(item.expiryDate);
         const diffTime = expDate.getTime() - this.today.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

         item.daysLeft = diffDays;

         if (diffDays < 0) {
            item.status = 'Expired';
         } else if (diffDays <= 3) {
            item.status = 'Expiring soon';
         } else {
            item.status = 'Good';
         }
      });
      this.calculateSummary();
   }

   calculateSummary() {
      this.totalItems = this.items.length;
      this.expiringSoonCount = this.items.filter(i => i.status === 'Expiring soon').length;
      this.expiredCount = this.items.filter(i => i.status === 'Expired').length;
      this.donatedCount = this.items.filter(i => i.status === 'Donated').length;
   }

   applyFilters() {
      this.filteredItems = this.items.filter(item => {
         const matchSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(this.searchTerm.toLowerCase());
         const matchCategory = this.selectedCategory === 'All' || item.category === this.selectedCategory;
         const matchLocation = this.selectedLocation === 'All' || item.location === this.selectedLocation;
         const matchStatus = this.selectedStatus === 'All' || item.status === this.selectedStatus;

         return matchSearch && matchCategory && matchLocation && matchStatus;
      });
   }

   onFilterChange() {
      this.applyFilters();
   }

   // Add Item Logic
   openAddModal() {
      this.addForm.reset({ category: 'Vegetable', location: 'Fridge', quantity: 1 });
      this.showAddModal = true;
   }

   closeAddModal() {
      this.showAddModal = false;
   }

   saveNewItem() {
      if (this.addForm.invalid) return;
      const val = this.addForm.value;
      const newItem: InventoryItem = {
         id: Math.random().toString(),
         name: val.name,
         category: val.category,
         location: val.location,
         quantity: val.quantity,
         expiryDate: val.expiryDate,
         note: val.note || '-',
         status: ''
      };
      this.items.push(newItem);
      this.updateItemStatuses();
      this.applyFilters();
      this.closeAddModal();
   }

   // Donate Logic
   openDonateModal(item: InventoryItem) {
      this.itemToDonate = item;
      this.donateForm.reset();
      this.showDonateModal = true;
   }

   closeDonateModal() {
      this.showDonateModal = false;
      this.itemToDonate = null;
   }

   confirmDonation() {
      if (this.donateForm.invalid || !this.itemToDonate) return;

      this.itemToDonate.status = 'Donated';
      this.calculateSummary();
      this.applyFilters();
      this.closeDonateModal();
   }

   // Delete Logic
   openDeleteModal(item: InventoryItem) {
      this.itemToDelete = item;
      this.showDeleteModal = true;
   }

   closeDeleteModal() {
      this.showDeleteModal = false;
      this.itemToDelete = null;
   }

   confirmDelete() {
      if (!this.itemToDelete) return;
      this.items = this.items.filter(i => i.id !== this.itemToDelete!.id);
      this.updateItemStatuses();
      this.applyFilters();
      this.closeDeleteModal();
   }

   getStatusClass(status: string) {
      switch (status) {
         case 'Good': return 'bg-green-100 text-green-800';
         case 'Expiring soon': return 'bg-yellow-100 text-yellow-800';
         case 'Expired': return 'bg-red-100 text-red-800';
         case 'Donated': return 'bg-gray-100 text-gray-500';
         default: return 'bg-gray-100 text-gray-800';
      }
   }
}