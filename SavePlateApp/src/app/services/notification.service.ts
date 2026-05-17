import { Injectable, computed, signal, inject } from '@angular/core';
import { InventoryService } from './inventory.service';
import { AnalyticsService } from './analytics.service';
import { AppNotification } from '../models/notification.model';
import { UserSettingsService } from './user-settings.service';

@Injectable({
   providedIn: 'root'
})
export class NotificationService {
   private settingsService = inject(UserSettingsService);

   constructor(
      private inventoryService: InventoryService,
      private analyticsService: AnalyticsService
   ) { }

   public notifications = computed(() => {
      const prefs = this.settingsService.preferences();

      // 1. Get notifications from InventoryService
      const inventoryNotifs = this.inventoryService.getNotifications().map(n => ({
         ...n,
         isRead: false,
         type: (n.type === 'danger' ? 'danger' : n.type) as any
      }));

      // 2. Get donation alerts dynamically from InventoryService
      const donatedNotifs: AppNotification[] = this.inventoryService.items()
         .filter(item => item.status === 'Donated')
         .map((item, index) => ({
            id: `donated-${item.id}`,
            title: 'DONATION SUCCESS',
            description: `${item.quantity} of ${item.name} donated successfully`,
            time: 'Just now',
            type: 'success',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            action: 'View Donation',
            isRead: false,
            details: {
               impactText: `Your donation was registered! This helps save food and support the community.`,
               actionButtons: [{ label: 'View Donation', action: 'view_donation', style: 'primary' as const }]
            }
         }));

      // 3. Get claimed alerts from InventoryService
      const claimedNotifs: AppNotification[] = this.inventoryService.items()
         .filter(item => item.isClaimed)
         .map((item) => ({
            id: `claimed-${item.id}`,
            title: 'ITEM CLAIMED',
            description: `You successfully claimed ${item.name}.`,
            time: 'Just now',
            type: 'info',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            action: 'View Inventory',
            isRead: false,
            details: {
               impactText: `You've helped reduce food waste by claiming this item! It has been added to your inventory.`,
               actionButtons: [{ label: 'View Inventory', action: 'view_inventory', style: 'primary' as const }]
            }
         }));

      let allNotifs = [...inventoryNotifs, ...donatedNotifs, ...claimedNotifs];

      // Apply settings logic to filter notifications
      if (!prefs.expiryAlerts) {
         allNotifs = allNotifs.filter(n => n.type !== 'danger' && n.type !== 'warning');
      }
      if (!prefs.donationUpdates) {
         allNotifs = allNotifs.filter(n => n.type !== 'success');
      }
      if (!prefs.weeklySummary) {
         allNotifs = allNotifs.filter(n => n.type !== 'info');
      }

      return allNotifs.reverse();
   });

   getAllNotifications(): AppNotification[] {
      return this.notifications();
   }
}
