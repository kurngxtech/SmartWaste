import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodItem, AddFoodItemDto, FoodStatus } from '../../app/shared/models/food-item';
import { FoodInventoryService } from '../../app/shared/services/food-inventory';
import { AddItemModalComponent } from './add-item/add-item-modal';

@Component({
  selector: 'app-food-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AddItemModalComponent],
  templateUrl: './food-inventory-page.html',
  styleUrl: './food-inventory-page.css',
})
export class FoodInventoryPage {
  private svc = inject(FoodInventoryService);

  showAddModal = signal(false);
  showDonateModal = signal(false);
  donatingItem = signal<FoodItem | null>(null);
  pickupAvailability = signal('');
  donateNote = signal('');
  donateError = signal('');

  searchQuery = signal('');
  categoryFilter = signal('');
  locationFilter = signal('');
  statusFilter = signal('');

  readonly categories = ['Vegetable', 'Fruit', 'Dairy', 'Meat', 'Grain', 'Snack', 'Beverage', 'Other'];
  readonly locations = ['Fridge', 'Pantry', 'Freezer'];
  readonly statuses = ['good', 'expiring', 'expired', 'donated'];

  readonly totalItems = this.svc.totalItems;
  readonly expiringSoonCount = this.svc.expiringSoonCount;
  readonly expiredCount = this.svc.expiredCount;
  readonly donatedCount = this.svc.donatedCount;

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    const loc = this.locationFilter();
    const status = this.statusFilter();

    return this.svc.items().filter(item =>
      (!q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)) &&
      (!cat || item.category === cat) &&
      (!loc || item.storageLocation === loc) &&
      (!status || item.status === status)
    );
  });

  onSaveItem(dto: AddFoodItemDto): void {
    this.svc.addItem(dto);
    this.showAddModal.set(false);
  }

  onDeleteItem(id: number): void {
    if (confirm('Delete this item from inventory?')) {
      this.svc.deleteItem(id);
    }
  }

  openDonateModal(item: FoodItem): void {
    this.donatingItem.set(item);
    this.pickupAvailability.set('');
    this.donateNote.set('');
    this.donateError.set('');
    this.showDonateModal.set(true);
  }

  confirmDonate(): void {
    if (!this.pickupAvailability().trim()) {
      this.donateError.set('Pickup availability is required.');
      return;
    }
    const item = this.donatingItem();
    if (item) {
      this.svc.convertToDonation(item.id);
    }
    this.showDonateModal.set(false);
    this.donatingItem.set(null);
  }

  closeDonateModal(): void {
    this.showDonateModal.set(false);
    this.donatingItem.set(null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.categoryFilter.set('');
    this.locationFilter.set('');
    this.statusFilter.set('');
  }

  getStatusLabel(status: FoodStatus): string {
    const map: Record<FoodStatus, string> = {
      good: 'Good',
      expiring: 'Expiring soon',
      expired: 'Expired',
      donated: 'Donated',
    };
    return map[status];
  }

  getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    return Math.round((exp.getTime() - today.getTime()) / 86400000);
  }
}