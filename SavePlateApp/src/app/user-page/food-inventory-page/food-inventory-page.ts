import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { MealPlannerService } from '../../services/meal-planner';
import { InventoryService, InventoryItem } from '../../services/inventory.service';
import { Router } from '@angular/router';

// Interface moved to service


@Component({
   selector: 'app-food-inventory-page',
   standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SideBarNavigation, Header],
   templateUrl: './food-inventory-page.html'
})
export class FoodInventoryPageComponent implements OnInit {
   items: InventoryItem[] = [];

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

   isEditMode = false;
   editingItemId: string | null = null;

   today = new Date(); // Will be synced from service in ngOnInit

   showToast = signal(false);

   triggerToast() {
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
   }

   constructor(
      private fb: FormBuilder,
      private mealPlannerService: MealPlannerService,
      private inventoryService: InventoryService,
      private router: Router
   ) {
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
      this.inventoryService.refreshStatuses();
      this.today = this.inventoryService.today;
      this.items = [...this.inventoryService.items()];
      this.calculateSummary();
      this.applyFilters();
   }

   updateItemStatuses() {
      this.inventoryService.refreshStatuses();
      this.items = [...this.inventoryService.items()];
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

   // Add/Edit Item Logic
   openAddModal() {
      this.isEditMode = false;
      this.editingItemId = null;
      this.addForm.reset({ category: 'Vegetable', location: 'Fridge', quantity: 1 });
      this.showAddModal = true;
   }

   openEditModal(item: InventoryItem) {
      this.isEditMode = true;
      this.editingItemId = item.id;
      this.addForm.patchValue({
         name: item.name,
         category: item.category,
         location: item.location,
         quantity: item.quantity,
         expiryDate: item.expiryDate,
         note: item.note === '-' ? '' : item.note
      });
      this.showAddModal = true;
   }

   closeAddModal() {
      this.showAddModal = false;
   }

   saveNewItem() {
      if (this.addForm.invalid) return;
      const val = this.addForm.value;
      
      if (this.isEditMode && this.editingItemId) {
         const itemIndex = this.items.findIndex(i => i.id === this.editingItemId);
         if (itemIndex > -1) {
            this.items[itemIndex] = {
               ...this.items[itemIndex],
               name: val.name,
               category: val.category,
               location: val.location,
               quantity: val.quantity,
               expiryDate: val.expiryDate,
               note: val.note || '-'
            };
         }
      } else {
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
      }
      this.inventoryService.updateItems(this.items);
      this.updateItemStatuses();
      this.applyFilters();
      this.closeAddModal();
      
      if (this.isEditMode) {
         this.triggerToast();
      }
   }

   // Mark as Used Logic
   markAsUsed(item: InventoryItem) {
      item.isUsed = true;
      this.inventoryService.updateItems(this.items);
   }

   undoMarkAsUsed(item: InventoryItem) {
      item.isUsed = false;
      this.inventoryService.updateItems(this.items);
   }

   // Plan for Meal Logic
   planForMeal(item: InventoryItem) {
      item.isPlanned = true;
      this.inventoryService.updateItems(this.items);
      
      // Sync item with meal planner inventory
      this.mealPlannerService.syncInventoryItem(item);
      
      // Add it as a reserved ingredient for a new meal plan
      this.mealPlannerService.addPlan({
         name: 'Meal with ' + item.name,
         day: 'Mon',
         slot: 'Dinner',
         date: '2026-04-20',
         ingredients: [{ itemId: item.id, itemName: item.name, quantity: 1 }],
         reminderEnabled: false
      });
      
      // Navigate to meal planner page
      this.router.navigate(['/meal-planner']);
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
      this.inventoryService.updateItems(this.items);
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
      this.inventoryService.updateItems(this.items);
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