export type FoodStatus = 'good' | 'expiring' | 'expired' | 'donated';
export type StorageLocation = 'Fridge' | 'Pantry' | 'Freezer';

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;      // ISO string: 'YYYY-MM-DD'
  storageLocation: StorageLocation;
  remarks?: string;
  status: FoodStatus;
}

export interface DonationDetails {
  pickupAvailability: string;
  note?: string;
}