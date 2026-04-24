import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
   selector: 'app-notifications-page',
   standalone: true,
   imports: [CommonModule, SideBarNavigation, Header, RouterLink],
   templateUrl: './notifications-page.html'
})
export class NotificationsPage {
   private notificationService = inject(NotificationService);
   notifications = this.notificationService.notifications;

   selectedNotif: any | null = null;

   constructor() { }

   openNotifModal(notif: any) {
      this.selectedNotif = notif;
   }

   closeNotifModal() {
      this.selectedNotif = null;
   }
}