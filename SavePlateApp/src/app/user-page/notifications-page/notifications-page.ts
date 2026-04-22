import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

@Component({
   selector: 'app-notifications-page',
   standalone: true,
   imports: [CommonModule, SideBarNavigation, Header, RouterLink],
   templateUrl: './notifications-page.html'
})
export class NotificationsPage {
   notifications: any[] = [];

   constructor(private inventoryService: InventoryService) {
      this.notifications = this.inventoryService.getNotifications();
   }
}