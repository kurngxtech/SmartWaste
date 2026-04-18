import { Injectable } from '@angular/core';

export interface FoodItem {
   id: string;
   name: string;
   category: 'Fridge' | 'Pantry' | 'Freezer';
   quantity: number; // in KG for simplicity, or count
   unit: string;
   expiryDate: string; // YYYY-MM-DD
   actionDate: string | null; // When it was consumed/donated/expired
   status: 'Available' | 'Expiring Soon' | 'Saved' | 'Donated' | 'Expired';
}

@Injectable({
   providedIn: 'root'
})
export class AnalyticsService {
   private mockData: FoodItem[] = [
      // Available & Expiring Soon
      { id: '1', name: 'Milk (Whole)', category: 'Fridge', quantity: 1.5, unit: 'Liters', expiryDate: '2026-04-20', actionDate: null, status: 'Expiring Soon' },
      { id: '2', name: 'Canned Beans', category: 'Pantry', quantity: 2.0, unit: 'KG', expiryDate: '2026-12-15', actionDate: null, status: 'Available' },
      { id: '3', name: 'Frozen Peas', category: 'Freezer', quantity: 1.0, unit: 'KG', expiryDate: '2026-11-01', actionDate: null, status: 'Available' },
      { id: '4', name: 'Bread', category: 'Pantry', quantity: 0.5, unit: 'KG', expiryDate: '2026-04-19', actionDate: null, status: 'Expiring Soon' },
      { id: '5', name: 'Chicken Breast', category: 'Freezer', quantity: 1.2, unit: 'KG', expiryDate: '2026-08-10', actionDate: null, status: 'Available' },

      // Saved (Consumed before expiry)
      { id: '6', name: 'Apples', category: 'Fridge', quantity: 1.5, unit: 'KG', expiryDate: '2026-04-10', actionDate: '2026-04-05', status: 'Saved' },
      { id: '7', name: 'Pasta', category: 'Pantry', quantity: 1.0, unit: 'KG', expiryDate: '2026-06-20', actionDate: '2026-03-15', status: 'Saved' },
      { id: '8', name: 'Carrots', category: 'Fridge', quantity: 0.8, unit: 'KG', expiryDate: '2026-04-01', actionDate: '2026-03-28', status: 'Saved' },
      { id: '9', name: 'Ground Beef', category: 'Freezer', quantity: 2.5, unit: 'KG', expiryDate: '2026-05-01', actionDate: '2026-04-10', status: 'Saved' },
      { id: '10', name: 'Rice', category: 'Pantry', quantity: 5.0, unit: 'KG', expiryDate: '2027-01-01', actionDate: '2026-02-10', status: 'Saved' },
      { id: '11', name: 'Cheese', category: 'Fridge', quantity: 0.4, unit: 'KG', expiryDate: '2026-03-20', actionDate: '2026-03-18', status: 'Saved' },

      // Donated
      { id: '12', name: 'Canned Soup', category: 'Pantry', quantity: 3.0, unit: 'KG', expiryDate: '2027-05-15', actionDate: '2026-04-12', status: 'Donated' },
      { id: '13', name: 'Oatmeal', category: 'Pantry', quantity: 1.5, unit: 'KG', expiryDate: '2026-10-10', actionDate: '2026-01-20', status: 'Donated' },
      { id: '14', name: 'Packaged Noodles', category: 'Pantry', quantity: 2.0, unit: 'KG', expiryDate: '2026-09-01', actionDate: '2026-02-15', status: 'Donated' },

      // Expired (Wasted)
      { id: '15', name: 'Spinach', category: 'Fridge', quantity: 0.3, unit: 'KG', expiryDate: '2026-04-10', actionDate: '2026-04-12', status: 'Expired' },
      { id: '16', name: 'Yogurt', category: 'Fridge', quantity: 0.5, unit: 'KG', expiryDate: '2026-03-15', actionDate: '2026-03-16', status: 'Expired' }
   ];

   constructor() { }

   getAllItems(): FoodItem[] {
      return this.mockData;
   }

   // Analytics Metrics
   getTotalFoodSavedKG(): number {
      return this.mockData
         .filter(item => item.status === 'Saved')
         .reduce((sum, item) => sum + item.quantity, 0);
   }

   getTotalDonationsKG(): number {
      return this.mockData
         .filter(item => item.status === 'Donated')
         .reduce((sum, item) => sum + item.quantity, 0);
   }

   getAlerts() {
      return this.mockData
         .filter(item => item.status === 'Expiring Soon')
         .map(item => ({
            title: 'EXPIRING ITEM',
            subtitle: `${item.name} expires on ${item.expiryDate}`
         }));
   }

   // Monthly Chart Data Generation based on filters
   getMonthlyImpactChart(monthsRange: number = 6, categoryFilter: string = 'All') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date('2026-04-18').getMonth(); // April is 3

      const chartData = [];

      for (let i = monthsRange - 1; i >= 0; i--) {
         let mIndex = currentMonth - i;
         if (mIndex < 0) mIndex += 12; // wrap around for previous year

         // Calculate saved/donated items for this month
         const itemsInMonth = this.mockData.filter(item => {
            if (!item.actionDate) return false;
            if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;

            const actionMonth = new Date(item.actionDate).getMonth();
            return actionMonth === mIndex && (item.status === 'Saved' || item.status === 'Donated');
         });

         const totalKG = itemsInMonth.reduce((sum, item) => sum + item.quantity, 0);

         // Calculate height percentage (assuming max 10KG per month for scale)
         const heightPercent = Math.min(100, Math.max(5, (totalKG / 10) * 100));

         chartData.push({
            month: months[mIndex],
            totalKG: totalKG.toFixed(1),
            height: `${Math.round(heightPercent)}%`
         });
      }

      return chartData;
   }
}
