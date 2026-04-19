import { Injectable, inject, signal, computed } from '@angular/core';
import {
  MealPlan,
  AddMealDto,
  Recipe,
  RecipeSuggestion,
  DayOfWeek,
  MealSlot,
} from '../models/meal-plan.model';
import { FoodInventoryService } from '../app/shared/services/food-inventory';
import { FoodItem } from '../app/shared/models/food-item';

@Injectable({ providedIn: 'root' })
export class MealPlannerService {
  private inventorySvc = inject(FoodInventoryService);

  private _plans = signal<MealPlan[]>([
    {
      id: 1,
      name: 'Spinach omelette',
      day: 'Mon',
      slot: 'Breakfast',
      date: this.getDateForDay('Mon'),
      ingredients: [
        { itemId: 1, itemName: 'Spinach', quantity: 1 },
      ],
      notes: '',
      reminderEnabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Chicken stir fry',
      day: 'Wed',
      slot: 'Dinner',
      date: this.getDateForDay('Wed'),
      ingredients: [
        { itemId: 4, itemName: 'Chicken Breast', quantity: 2 },
      ],
      notes: '',
      reminderEnabled: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  private nextId = 3;

  private _recipes = signal<Recipe[]>([
    { id: 1, name: 'Spinach omelette', slot: 'Breakfast', prepTime: 15,
      requiredIngredients: ['Spinach'], description: 'Quick healthy breakfast' },
    { id: 2, name: 'Chicken stir fry', slot: 'Dinner', prepTime: 25,
      requiredIngredients: ['Chicken Breast'], description: 'Savory weekday dinner' },
    { id: 3, name: 'Milk porridge', slot: 'Breakfast', prepTime: 10,
      requiredIngredients: ['Milk', 'Rice'], description: 'Warm and comforting' },
    { id: 4, name: 'Apple salad', slot: 'Lunch', prepTime: 8,
      requiredIngredients: ['Apple'], description: 'Light and fresh' },
    { id: 5, name: 'Grilled chicken rice bowl', slot: 'Lunch', prepTime: 30,
      requiredIngredients: ['Chicken Breast', 'Rice'], description: 'Balanced meal' },
    { id: 6, name: 'Spinach smoothie', slot: 'Snack', prepTime: 5,
      requiredIngredients: ['Spinach', 'Milk', 'Apple'], description: 'Nutrient-packed snack' },
    { id: 7, name: 'Apple oatmeal', slot: 'Breakfast', prepTime: 12,
      requiredIngredients: ['Apple'], description: 'Sweet morning start' },
  ]);

  readonly plans = this._plans.asReadonly();
  readonly recipes = this._recipes.asReadonly();

  readonly reservedByItemId = computed(() => {
    const map = new Map<number, number>();
    this._plans().forEach(plan => {
      plan.ingredients.forEach(ing => {
        map.set(ing.itemId, (map.get(ing.itemId) || 0) + ing.quantity);
      });
    });
    return map;
  });

  readonly upcomingReminders = computed(() => {
    return this._plans()
      .filter(p => p.reminderEnabled)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  });

  getPlansForDayAndSlot(day: DayOfWeek, slot: MealSlot): MealPlan[] {
    return this._plans().filter(p => p.day === day && p.slot === slot);
  }

  addPlan(dto: AddMealDto): void {
    const newPlan: MealPlan = {
      ...dto,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
    };
    this._plans.update(prev => [...prev, newPlan]);
  }

  removePlan(id: number): void {
    this._plans.update(prev => prev.filter(p => p.id !== id));
  }

  getSuggestions(): RecipeSuggestion[] {
    const inventory = this.inventorySvc.items();
    const expiringNames = inventory
      .filter(i => i.status === 'expiring' || i.status === 'expired')
      .map(i => i.name.toLowerCase());
    const availableNames = inventory
      .filter(i => i.status !== 'donated')
      .map(i => i.name.toLowerCase());

    return this._recipes()
      .map(recipe => {
        const matched = recipe.requiredIngredients
          .filter(ing => availableNames.includes(ing.toLowerCase()));
        const usesExpiring = recipe.requiredIngredients
          .some(ing => expiringNames.includes(ing.toLowerCase()));
        return {
          ...recipe,
          matchCount: matched.length,
          matchedIngredients: matched,
          usesExpiring,
        };
      })
      .filter(r => r.matchCount > 0)
      .sort((a, b) => {
        if (a.usesExpiring !== b.usesExpiring) return a.usesExpiring ? -1 : 1;
        return b.matchCount - a.matchCount;
      });
  }

  getAvailableInventory(): FoodItem[] {
    return this.inventorySvc.items().filter(i => i.status !== 'donated');
  }

  private getDateForDay(day: DayOfWeek): string {
    const dayMap: Record<DayOfWeek, number> = {
      Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0,
    };
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const targetIdx = dayMap[day] === 0 ? 6 : dayMap[day] - 1;
    const target = new Date(monday);
    target.setDate(monday.getDate() + targetIdx);
    return target.toISOString().split('T')[0];
  }
}