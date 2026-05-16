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

      // 2. Get alerts from AnalyticsService and convert to AppNotification
      // Note: Since AnalyticsService.getAlerts() doesn't use signals yet, 
      // this won't auto-update unless AnalyticsService is changed.
      // However, it will update when inventoryService changes.
      const analyticsNotifs: AppNotification[] = this.analyticsService.getAlerts().map((alert, index) => {
         let type: 'danger' | 'warning' | 'success' | 'info' = 'info';
         let icon = '';
         let action = 'View Details';

         if (alert.type === 'success') {
            type = 'success';
            icon = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
            action = 'View Donation';
         } else if (alert.type === 'alert') {
            type = 'danger';
            icon = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
            action = 'Check Item';
         }

         return {
            id: `analytics-${index}`,
            title: alert.title,
            description: alert.subtitle,
            time: 'Today',
            type,
            icon,
            action,
            isRead: false
         };
      });

      let allNotifs = [...inventoryNotifs, ...analyticsNotifs];

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

      return allNotifs;
   });

   getAllNotifications(): AppNotification[] {
      return this.notifications();
   }
}
