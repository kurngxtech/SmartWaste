export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface MealIngredient {
  itemId: number;
  itemName: string;
  quantity: number;
}

export interface MealPlan {
  id: number;
  name: string;
  day: DayOfWeek;
  slot: MealSlot;
  date: string;
  ingredients: MealIngredient[];
  notes: string;
  reminderEnabled: boolean;
  createdAt: string;
}

export interface AddMealDto {
  name: string;
  day: DayOfWeek;
  slot: MealSlot;
  date: string;
  ingredients: MealIngredient[];
  notes: string;
  reminderEnabled: boolean;
}

export interface Recipe {
  id: number;
  name: string;
  slot: MealSlot;
  prepTime: number;
  requiredIngredients: string[];
  description: string;
}

export interface RecipeSuggestion extends Recipe {
  matchCount: number;
  matchedIngredients: string[];
  usesExpiring: boolean;
}