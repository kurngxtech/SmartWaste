import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
   MealPlan,
   AddMealDto,
   DayOfWeek,
   MealSlot,
   Recipe,
   RecipeSuggestion
} from '../models/meal-plan.model';
import { FoodItem } from '../shared/models/food-item';
import { InventoryService } from './inventory.service';
import { inject } from '@angular/core';

@Injectable({
   providedIn: 'root',
})
export class MealPlannerService {
   private inventoryService = inject(InventoryService);
   private http = inject(HttpClient);
   
   private _plans = signal<MealPlan[]>([]);
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
   
   constructor() {
      this.loadPlans();
   }

   loadPlans(): void {
      this.http.get<{ success: boolean, data: MealPlan[] }>('/api/mealplans').subscribe({
         next: (res) => {
            if (res.success) {
               this._plans.set(res.data);
            }
         },
         error: (err) => console.error('Failed to load meal plans', err)
      });
   }

   getAvailableInventory(): any[] {
      return this.inventoryService.items();
   }

   syncInventoryItem(item: any): void {
      // Logic handled by InventoryService
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
      const map = new Map<string, number>();
      this.plans().forEach(plan => {
         plan.ingredients.forEach(ing => {
            const id = String(ing.itemId);
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

   getPlansForDateAndSlot(date: string, slot: MealSlot): MealPlan[] {
      return this.plans().filter(p => p.date === date && p.slot === slot);
   }

   addPlan(dto: AddMealDto): void {
      this.http.post<{ success: boolean, data: MealPlan }>('/api/mealplans', dto).subscribe({
         next: (res) => {
            if (res.success) {
               this._plans.update(plans => [...plans, res.data]);
               // Refresh inventory because quantities were reduced
               this.inventoryService.loadItems().subscribe();
            }
         },
         error: (err) => console.error('Failed to save meal plan', err)
      });
   }

   removePlan(id: number | string): void {
      this.http.delete(`/api/mealplans/${id}`).subscribe({
         next: () => {
            this._plans.update(plans => plans.filter(p => String(p.id) !== String(id)));
         },
         error: (err) => console.error('Failed to remove meal plan', err)
      });
   }

   clearPlans(): void {
      this._plans.set([]);
   }
}
