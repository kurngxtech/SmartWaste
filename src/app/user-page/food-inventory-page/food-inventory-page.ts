import { Component, OnInit, signal, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { MealPlannerService } from '../../services/meal-planner';
import { InventoryService, InventoryItem } from '../../services/inventory.service';
import { Router, ActivatedRoute } from '@angular/router';

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

   today = new Date();
   showToast = signal(false);
   isLoading = false;

   triggerToast() {
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
   }

   constructor(
      private fb: FormBuilder,
      private mealPlannerService: MealPlannerService,
      private inventoryService: InventoryService,
      private router: Router,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
      @Inject(PLATFORM_ID) private platformId: Object
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
      // Only load data in the browser — SSR has no auth token
      if (!isPlatformBrowser(this.platformId)) return;

      this.loadAllInventory();

      this.route.queryParams.subscribe(params => {
         if (params['action'] === 'donate' && params['itemId']) {
            this.inventoryService.loadItems().subscribe(() => {
               const itemToDonate = this.inventoryService.items().find(i => i.id === params['itemId']);
               if (itemToDonate) {
                  this.openDonateModal(itemToDonate);
               }
            });
         }
      });
   }

   loadAllInventory() {
      this.isLoading = true;
      this.inventoryService.loadItems().subscribe({
         next: () => {
            this.isLoading = false;
            this.today = this.inventoryService.today;
            this.items = [...this.inventoryService.items()];
            this.calculateSummary();
            this.applyFilters();
            this.cdr.detectChanges();
         },
         error: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
         }
      });
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
      }).reverse();
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
      this.isLoading = true;
      
      if (this.isEditMode && this.editingItemId) {
         this.inventoryService.updateItem(this.editingItemId, val).subscribe({
            next: () => {
               this.isLoading = false;
               this.items = [...this.inventoryService.items()];
               this.calculateSummary();
               this.applyFilters();
               this.closeAddModal();
               this.triggerToast();
            },
            error: () => this.isLoading = false
         });
      } else {
         this.inventoryService.addItem(val).subscribe({
            next: () => {
               this.isLoading = false;
               this.items = [...this.inventoryService.items()];
               this.calculateSummary();
               this.applyFilters();
               this.closeAddModal();
               this.triggerToast();
            },
            error: (err) => {
               this.isLoading = false;
               alert('Error adding food item: ' + (err.error?.message || 'Server error'));
            }
         });
      }
   }

   // Mark as Used Logic
   markAsUsed(item: InventoryItem) {
      this.inventoryService.updateItem(item.id, { isUsed: true }).subscribe(() => {
         this.items = [...this.inventoryService.items()];
         this.calculateSummary();
         this.applyFilters();
      });
   }

   undoMarkAsUsed(item: InventoryItem) {
      this.inventoryService.updateItem(item.id, { isUsed: false }).subscribe(() => {
         this.items = [...this.inventoryService.items()];
         this.calculateSummary();
         this.applyFilters();
      });
   }

   // Plan for Meal Logic
   planForMeal(item: InventoryItem) {
      this.inventoryService.updateItem(item.id, { status: 'Planned' }).subscribe(() => {
         this.items = [...this.inventoryService.items()];
         this.calculateSummary();
         this.applyFilters();
         
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
         
         this.router.navigate(['/meal-planner']);
      });
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

      const noteText = this.donateForm.get('note')?.value || '';
      const pickup = this.donateForm.get('pickupAvailability')?.value || '';
      const fullNote = `Pickup: ${pickup}; Note: ${noteText}`;

      this.inventoryService.updateItem(this.itemToDonate.id, { 
         status: 'Donated',
         note: fullNote
      }).subscribe(() => {
         this.items = [...this.inventoryService.items()];
         this.calculateSummary();
         this.applyFilters();
         this.closeDonateModal();
      });
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
      this.inventoryService.removeItem(this.itemToDelete.id).subscribe(() => {
         this.items = [...this.inventoryService.items()];
         this.calculateSummary();
         this.applyFilters();
         this.closeDeleteModal();
      });
   }

   getStatusClass(status: string) {
      switch (status) {
         case 'Good': return 'bg-green-100 text-green-800';
         case 'Expiring soon': return 'bg-yellow-100 text-yellow-800';
         case 'Expired': return 'bg-red-100 text-red-800';
         case 'Donated': return 'bg-gray-100 text-gray-500';
         case 'Planned': return 'bg-blue-100 text-blue-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   }
}