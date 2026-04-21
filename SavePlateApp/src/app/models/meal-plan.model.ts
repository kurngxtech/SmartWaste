export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface MealIngredient {
  itemId: string | number;
  itemName: string;
  quantity: number;
}

export interface MealPlan {
  id: number;
  name: string;
  day: DayOfWeek;
  slot: MealSlot;
  date: string; // YYYY-MM-DD
  ingredients: MealIngredient[];
  notes?: string;
  reminderEnabled: boolean;
}

export interface AddMealDto {
  name: string;
  day: DayOfWeek;
  slot: MealSlot;
  date: string;
  ingredients: MealIngredient[];
  notes?: string;
  reminderEnabled: boolean;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  slot: MealSlot;
  prepTime: number;
  requiredIngredients: string[];
}

export interface RecipeSuggestion extends Recipe {
  matchedIngredients: string[];
  usesExpiring: boolean;
}
