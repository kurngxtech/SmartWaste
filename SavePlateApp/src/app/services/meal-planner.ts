import { Injectable, signal, computed } from '@angular/core';
import {
   MealPlan,
   AddMealDto,
   DayOfWeek,
   MealSlot,
   Recipe,
   RecipeSuggestion
} from '../models/meal-plan.model';
import { FoodItem } from '../shared/models/food-item';

@Injectable({
   providedIn: 'root',
})
export class MealPlannerService {
   private _plans = signal<MealPlan[]>([
      {
         id: 1,
         name: 'Spinach Omelette',
         day: 'Mon',
         slot: 'Breakfast',
         date: '2026-04-20',
         ingredients: [{ itemId: 1, itemName: 'Spinach', quantity: 1 }],
         reminderEnabled: true,
      },
   ]);

   readonly plans = this._plans.asReadonly();

   private recipes: Recipe[] = [
      {
         id: 1,
         name: 'Chicken Salad',
         description: 'Healthy and quick chicken salad with spinach.',
         slot: 'Lunch',
         prepTime: 15,
         requiredIngredients: ['Chicken Breast', 'Spinach'],
      },
      {
         id: 2,
         name: 'Beef Stew',
         description: 'Hearty beef stew with carrots and potatoes.',
         slot: 'Dinner',
         prepTime: 45,
         requiredIngredients: ['Ground Beef', 'Carrots'],
      },
   ];

   getAvailableInventory(): FoodItem[] {
      // Mock inventory based on FoodInventoryPageComponent data
      return [
         { id: 1, name: 'Spinach', quantity: 2, status: 'expiring' },
         { id: 2, name: 'Milk', quantity: 1, status: 'good' },
         { id: 3, name: 'Chicken Breast', quantity: 3, status: 'good' },
         { id: 4, name: 'Apples', quantity: 6, status: 'good' },
      ];
   }

   getSuggestions(): RecipeSuggestion[] {
      const inventory = this.getAvailableInventory();
      return this.recipes.map(recipe => {
         const matched = recipe.requiredIngredients.filter(req =>
            inventory.some(inv => inv.name.toLowerCase() === req.toLowerCase())
         );
         const usesExpiring = inventory.some(inv =>
            matched.includes(inv.name) && inv.status === 'expiring'
         );
         return {
            ...recipe,
            matchedIngredients: matched,
            usesExpiring,
         };
      }).filter(r => r.matchedIngredients.length > 0);
   }

   readonly reservedByItemId = computed(() => {
      const map = new Map<number | string, number>();
      this.plans().forEach(plan => {
         plan.ingredients.forEach(ing => {
            const id = ing.itemId;
            map.set(id, (map.get(id) || 0) + ing.quantity);
         });
      });
      return map;
   });

   readonly upcomingReminders = computed(() => {
      return this.plans()
         .filter(p => p.reminderEnabled)
         .map(p => ({
            name: p.name,
            day: p.day,
            slot: p.slot,
         }));
   });

   getPlansForDayAndSlot(day: DayOfWeek, slot: MealSlot): MealPlan[] {
      return this.plans().filter(p => p.day === day && p.slot === slot);
   }

   addPlan(dto: AddMealDto): void {
      const newPlan: MealPlan = {
         ...dto,
         id: Date.now(),
      };
      this._plans.update(plans => [...plans, newPlan]);
   }

   removePlan(id: number): void {
      this._plans.update(plans => plans.filter(p => p.id !== id));
   }
}
