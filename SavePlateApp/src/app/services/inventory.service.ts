import { Injectable, signal } from '@angular/core';

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
   isUsed?: boolean;
   isPlanned?: boolean;
}

@Injectable({
   providedIn: 'root'
})
export class InventoryService {
   private _items = signal<InventoryItem[]>([
      { id: '1', name: 'Spinach', category: 'Vegetable', quantity: 2, expiryDate: '2026-04-22', location: 'Fridge', status: '', note: 'Organic' },
      { id: '2', name: 'Milk', category: 'Dairy', quantity: 1, expiryDate: '2026-04-20', location: 'Fridge', status: '', note: '-' },
      { id: '3', name: 'Rice', category: 'Grain', quantity: 5, expiryDate: '2026-12-01', location: 'Pantry', status: '', note: 'Jasmine rice' },
      { id: '4', name: 'Chicken Breast', category: 'Meat', quantity: 3, expiryDate: '2026-04-25', location: 'Freezer', status: '', note: '-' },
      { id: '5', name: 'Apple', category: 'Fruit', quantity: 6, expiryDate: '2026-05-10', location: 'Fridge', status: '', note: '-' },
      { id: '6', name: 'Pork Belly', category: 'Meat', quantity: 1, expiryDate: '2026-04-25', location: 'Freezer', status: '', note: '-' }
   ]);

   today = new Date('2026-04-19T00:00:00');

   readonly items = this._items.asReadonly();

   constructor() {
      this.refreshStatuses();
   }

   refreshStatuses() {
      this._items.update(items => {
         return items.map(item => {
            if (item.status === 'Donated') return item;

            const expDate = new Date(item.expiryDate);
            const diffTime = expDate.getTime() - this.today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            item.daysLeft = diffDays;

            if (diffDays <= 0) {
               item.status = 'Expired';
            } else if (diffDays <= 3) {
               item.status = 'Expiring soon';
            } else {
               item.status = 'Good';
            }
            return item;
         });
      });
   }

   getNotifications() {
      return this._items().filter(item => item.status === 'Expired' || item.status === 'Expiring soon')
         .map(item => ({
            id: item.id,
            title: item.status === 'Expired' ? 'Food Expired' : 'Expiring Soon',
            description: item.status === 'Expired' 
               ? `${item.name} has expired. Please dispose of it safely.` 
               : `${item.name} in your ${item.location} is expiring in ${item.daysLeft} days.`,
            time: 'Just now',
            type: item.status === 'Expired' ? 'danger' : 'warning',
            icon: item.status === 'Expired' 
               ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' 
               : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            action: item.status === 'Expired' ? 'Remove Item' : 'Plan Meal'
         }));
   }

   getDashboardAlerts() {
      return this._items().filter(item => item.status === 'Expired' || item.status === 'Expiring soon')
         .map(item => ({
            type: item.status === 'Expired' ? 'alert' : 'warning',
            title: item.status === 'Expired' ? 'EXPIRED ITEM' : 'EXPIRING ITEM',
            subtitle: item.status === 'Expired' 
               ? `${item.name} expired on ${item.expiryDate}` 
               : `${item.name} expires in ${item.daysLeft} days`
         }));
   }

   updateItems(newItems: InventoryItem[]) {
      this._items.set(newItems);
   }

   addItem(item: InventoryItem) {
      this._items.update(items => [...items, item]);
   }

   removeItem(id: string) {
      this._items.update(items => items.filter(i => i.id !== id));
   }
}
