export type FoodStatus = 'good' | 'expiring' | 'expired' | 'donated';
export type StorageLocation = 'Fridge' | 'Pantry' | 'Freezer';
export type FoodCategory = 'Vegetable' | 'Fruit' | 'Dairy' | 'Meat' | 'Grain' | 'Snack' | 'Beverage' | 'Other';

export interface FoodItem {
  id: number;
  name: string;
  category: FoodCategory;
  quantity: number;
  expiryDate: string;
  storageLocation: StorageLocation;
  remarks: string;
  status: FoodStatus;
  createdAt: string;
}

export interface AddFoodItemDto {
  name: string;
  category: FoodCategory;
  quantity: number;
  expiryDate: string;
  storageLocation: StorageLocation;
  remarks: string;
}
