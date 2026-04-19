import { Injectable, signal, computed } from '@angular/core';
import { FoodItem, AddFoodItemDto, FoodStatus } from '../models/food-item';

@Injectable({ providedIn: 'root' })
export class FoodInventoryService {
  private _items = signal<FoodItem[]>([
    {
      id: 1,
      name: 'Spinach',
      category: 'Vegetable',
      quantity: 2,
      expiryDate: '2026-04-22',
      storageLocation: 'Fridge',
      remarks: 'Organic',
      status: 'expiring',
      createdAt: '2026-04-18',
    },
    {
      id: 2,
      name: 'Milk',
      category: 'Dairy',
      quantity: 1,
      expiryDate: '2026-04-19',
      storageLocation: 'Fridge',
      remarks: '',
      status: 'expiring',
      createdAt: '2026-04-17',
    },
    {
      id: 3,
      name: 'Rice',
      category: 'Grain',
      quantity: 5,
      expiryDate: '2026-12-01',
      storageLocation: 'Pantry',
      remarks: 'Jasmine rice',
      status: 'good',
      createdAt: '2026-04-10',
    },
    {
      id: 4,
      name: 'Chicken Breast',
      category: 'Meat',
      quantity: 3,
      expiryDate: '2026-04-25',
      storageLocation: 'Freezer',
      remarks: '',
      status: 'good',
      createdAt: '2026-04-18',
    },
    {
      id: 5,
      name: 'Apple',
      category: 'Fruit',
      quantity: 6,
      expiryDate: '2026-05-10',
      storageLocation: 'Fridge',
      remarks: '',
      status: 'good',
      createdAt: '2026-04-15',
    },
  ]);

  private nextId = 6;

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().filter(i => i.status !== 'donated').length
  );

  readonly expiringSoonCount = computed(() =>
    this._items().filter(i => i.status === 'expiring').length
  );

  readonly expiredCount = computed(() =>
    this._items().filter(i => i.status === 'expired').length
  );

  readonly donatedCount = computed(() =>
    this._items().filter(i => i.status === 'donated').length
  );

  addItem(dto: AddFoodItemDto): void {
    const status = this.computeStatus(dto.expiryDate);
    const newItem: FoodItem = {
      ...dto,
      id: this.nextId++,
      status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this._items.update(prev => [newItem, ...prev]);
  }

  deleteItem(id: number): void {
    this._items.update(prev => prev.filter(i => i.id !== id));
  }

  convertToDonation(id: number): void {
    this._items.update(prev =>
      prev.map(i => i.id === id ? { ...i, status: 'donated' as FoodStatus } : i)
    );
  }

  computeStatus(expiryDate: string): FoodStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    const diffDays = Math.round((exp.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'expiring';
    return 'good';
  }
}