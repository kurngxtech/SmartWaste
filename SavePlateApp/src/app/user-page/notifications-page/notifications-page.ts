import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { NotificationService } from '../../services/notification.service';
import { AppNotification } from '../../models/notification.model';
import { InventoryService } from '../../services/inventory.service';
import { MealPlannerService } from '../../services/meal-planner';

@Component({
   selector: 'app-notifications-page',
   standalone: true,
   imports: [CommonModule, SideBarNavigation, Header],
   templateUrl: './notifications-page.html'
})
export class NotificationsPage {
   private notificationService = inject(NotificationService);
   private inventoryService = inject(InventoryService);
   private mealPlannerService = inject(MealPlannerService);
   private router = inject(Router);

   notifications: Signal<AppNotification[]> = this.notificationService.notifications;

   selectedNotif: any | null = null;

   constructor() { }

   openNotifModal(notif: any) {
      this.selectedNotif = notif;
   }

   closeNotifModal() {
      this.selectedNotif = null;
   }

   handleAction(action: string) {
      if (!this.selectedNotif) return;

      if (action === 'plan') {
         const item = this.inventoryService.getItemById(this.selectedNotif.id);
         if (item && !item.isPlanned) {
            this.inventoryService.planItem(item.id);
            this.mealPlannerService.syncInventoryItem(item);
            this.mealPlannerService.addPlan({
               name: 'Meal with ' + item.name,
               day: 'Mon',
               slot: 'Dinner',
               date: '2026-04-20',
               ingredients: [{ itemId: item.id, itemName: item.name, quantity: 1 }],
               reminderEnabled: false
            });
         }
      } else if (action === 'donate') {
         this.router.navigate(['/food-inventory'], { queryParams: { action: 'donate', itemId: this.selectedNotif.id } });
      } else if (action === 'view_donation') {
         this.router.navigate(['/donation-hub']);
      } else if (action === 'view_inventory') {
         this.router.navigate(['/food-inventory']);
      } else if (action === 'remove') {
         this.inventoryService.removeItem(this.selectedNotif.id);
      }
      
      this.closeNotifModal();
   }
}