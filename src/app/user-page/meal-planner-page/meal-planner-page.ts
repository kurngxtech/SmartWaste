import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealPlannerService } from '../../services/meal-planner';
import { Header } from '../header/header';
import {
   MealPlan,
   AddMealDto,
   DayOfWeek,
   MealSlot,
   Recipe,
   RecipeSuggestion,
} from '../../models/meal-plan.model';
import { AddMealModalComponent } from './add-meal-modal/add-meal-modal';
import { SideBarNavigation } from "../side-bar-navigation/side-bar-navigation";

interface CalendarDay {
   day: DayOfWeek;
   date: Date;
   isToday: boolean;
}

@Component({
   selector: 'app-meal-planner-page',
   standalone: true,
   imports: [CommonModule, FormsModule, AddMealModalComponent, SideBarNavigation, Header],
   templateUrl: './meal-planner-page.html',
   styleUrl: './meal-planner-page.css',
})
export class MealPlannerPage {
   private svc = inject(MealPlannerService);

   readonly days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
   readonly slots: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

   weekOffset = signal(0);
   showModal = signal(false);
   modalDay = signal<DayOfWeek>('Mon');
   modalSlot = signal<MealSlot>('Breakfast');
   prefillRecipe = signal<Recipe | null>(null);
   showToast = signal(false);

   triggerToast() {
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
   }

   readonly calendarDays = computed<CalendarDay[]>(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dow = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + this.weekOffset() * 7);

      return this.days.map((day, i) => {
         const date = new Date(monday);
         date.setDate(monday.getDate() + i);
         return {
            day,
            date,
            isToday: date.getTime() === today.getTime(),
         };
      });
   });

   readonly weekLabel = computed(() => {
      const dates = this.calendarDays();
      const fmt = (d: Date) =>
         d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `${fmt(dates[0].date)} – ${fmt(dates[6].date)} ${dates[0].date.getFullYear()}`;
   });

   readonly suggestions = computed<RecipeSuggestion[]>(() => this.svc.getSuggestions());

   readonly reservedList = computed(() => {
      const map = this.svc.reservedByItemId();
      // Use ALL inventory items (not just available) so fully-consumed items still appear
      const inventory = this.svc.getAllInventoryItems();
      return inventory
         .filter(i => map.has(i.id))
         .map(i => ({
            name: i.name,
            reserved: map.get(i.id)!,
            total: i.quantity,
         }));
   });

   readonly reminders = computed(() => this.svc.upcomingReminders());

   readonly plannedCount = computed(() => this.svc.plans().length);

   getPlansForCell(date: Date, slot: MealSlot): MealPlan[] {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const dateStr = `${date.getFullYear()}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
      return this.svc.getPlansForDateAndSlot(dateStr, slot);
   }

   openModal(day: DayOfWeek, slot: MealSlot, recipe: Recipe | null = null): void {
      this.modalDay.set(day);
      this.modalSlot.set(slot);
      this.prefillRecipe.set(recipe);
      this.showModal.set(true);
   }

   openModalFromRecipe(recipe: Recipe): void {
      // Find today's day of week
      const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayIdx = new Date().getDay();
      const todayDay = (todayIdx === 0 ? 'Sun' : days[todayIdx]) as DayOfWeek;

      this.modalDay.set(todayDay);
      this.modalSlot.set(recipe.slot);
      this.prefillRecipe.set(recipe);
      this.showModal.set(true);
   }

   onSaveMeal(dto: AddMealDto): void {
      this.svc.addPlan(dto);
      this.showModal.set(false);
      this.prefillRecipe.set(null);
      this.triggerToast();
   }

   onCloseModal(): void {
      this.showModal.set(false);
      this.prefillRecipe.set(null);
   }

   removePlan(id: number, event: Event): void {
      event.stopPropagation();
      if (confirm('Remove this meal from the plan?')) {
         this.svc.removePlan(id);
      }
   }

   changeWeek(delta: number): void {
      this.weekOffset.update(v => v + delta);
   }

   goToday(): void {
      this.weekOffset.set(0);
   }

   getSlotChipClass(slot: string): string {
      switch (slot.toLowerCase()) {
         case 'breakfast': return 'bg-blue-100 text-blue-800';
         case 'lunch': return 'bg-green-100 text-green-800';
         case 'dinner': return 'bg-indigo-100 text-indigo-800';
         case 'snack': return 'bg-amber-100 text-amber-800';
         default: return 'bg-gray-100 text-gray-800';
      }
   }

   getDotClass(slot: string): string {
      switch (slot.toLowerCase()) {
         case 'breakfast': return 'bg-blue-500';
         case 'lunch': return 'bg-green-600';
         case 'dinner': return 'bg-indigo-500';
         case 'snack': return 'bg-amber-500';
         default: return 'bg-gray-500';
      }
   }
}