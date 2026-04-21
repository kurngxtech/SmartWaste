export interface FoodItem {
   id: number;
   name: string;
   category?: string;
   quantity: number;
   expiryDate?: string;
   location?: string;
   status: 'good' | 'expiring' | 'expired' | 'Available' | 'Expiring Soon' | 'Saved' | 'Donated' | 'Expired';
   note?: string;
}
