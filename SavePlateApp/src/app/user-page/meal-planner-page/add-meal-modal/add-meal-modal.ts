import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
   AddMealDto,
   DayOfWeek,
   MealSlot,
   MealIngredient,
   Recipe,
} from '../../../models/meal-plan.model';
import { MealPlannerService } from '../../../services/meal-planner';
import { FoodItem } from '../../../shared/models/food-item';

@Component({
   selector: 'app-add-meal-modal',
   standalone: true,
   imports: [CommonModule, FormsModule],
   templateUrl: './add-meal-modal.html',
   styleUrl: './add-meal-modal.css',
})
export class AddMealModalComponent implements OnInit {
   private svc = inject(MealPlannerService);

   @Input() defaultDay: DayOfWeek = 'Mon';
   @Input() defaultSlot: MealSlot = 'Breakfast';
   @Input() prefillRecipe: Recipe | null = null;
   @Input() baseDate: Date = new Date();

   @Output() close = new EventEmitter<void>();
   @Output() save = new EventEmitter<AddMealDto>();

   readonly days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
   readonly slots: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

   mealName = signal('');
   selectedDay = signal<DayOfWeek>('Mon');
   selectedSlot = signal<MealSlot>('Breakfast');
   selectedIngredients = signal<MealIngredient[]>([]);
   notes = signal('');
   reminderEnabled = signal(true);
   error = signal('');

   availableItems: FoodItem[] = [];

   ngOnInit(): void {
      this.selectedDay.set(this.defaultDay);
      this.selectedSlot.set(this.defaultSlot);
      this.availableItems = this.svc.getAvailableInventory();

      if (this.prefillRecipe) {
         this.mealName.set(this.prefillRecipe.name);
         this.selectedSlot.set(this.prefillRecipe.slot);
         const prefilled: MealIngredient[] = [];
         this.prefillRecipe.requiredIngredients.forEach(ing => {
            const item = this.availableItems.find(
               i => i.name.toLowerCase() === ing.toLowerCase()
            );
            if (item) {
               prefilled.push({
                  itemId: item.id,
                  itemName: item.name,
                  quantity: 1,
               });
            }
         });
         this.selectedIngredients.set(prefilled);
      }
   }

   isIngredientSelected(itemId: number): boolean {
      return this.selectedIngredients().some(i => i.itemId === itemId);
   }

   getIngredientQty(itemId: number): number {
      return this.selectedIngredients().find(i => i.itemId === itemId)?.quantity || 1;
   }

   toggleIngredient(item: FoodItem): void {
      const current = this.selectedIngredients();
      const exists = current.find(i => i.itemId === item.id);
      if (exists) {
         this.selectedIngredients.set(current.filter(i => i.itemId !== item.id));
      } else {
         this.selectedIngredients.set([
            ...current,
            { itemId: item.id, itemName: item.name, quantity: 1 },
         ]);
      }
   }

   updateQty(itemId: number, qty: number): void {
      if (qty < 1) return;
      this.selectedIngredients.set(
         this.selectedIngredients().map(i =>
            i.itemId === itemId ? { ...i, quantity: qty } : i
         )
      );
   }

   private getDateForDay(day: DayOfWeek): string {
      const dayMap: Record<DayOfWeek, number> = {
         Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0,
      };

      // Use baseDate (Monday of the viewed week) instead of 'new Date()'
      const monday = new Date(this.baseDate);
      monday.setHours(0, 0, 0, 0);

      const targetIdx = dayMap[day] === 0 ? 6 : dayMap[day] - 1;
      const target = new Date(monday);
      target.setDate(monday.getDate() + targetIdx);
      return target.toISOString().split('T')[0];
   }

   onSave(): void {
      if (!this.mealName().trim()) {
         this.error.set('Meal name is required.');
         return;
      }

      this.save.emit({
         name: this.mealName().trim(),
         day: this.selectedDay(),
         slot: this.selectedSlot(),
         date: this.getDateForDay(this.selectedDay()),
         ingredients: this.selectedIngredients(),
         notes: this.notes().trim(),
         reminderEnabled: this.reminderEnabled(),
      });
   }

   onClose(): void {
      this.close.emit();
   }

   isExpiringItem(item: FoodItem): boolean {
      return item.status === 'expiring' || item.status === 'expired';
   }
}