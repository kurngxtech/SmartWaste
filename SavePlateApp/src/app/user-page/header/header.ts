import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { LayoutService } from '../../services/layout.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-header',
   standalone: true,
   imports: [RouterLink, CommonModule],
   templateUrl: './header.html',
   styleUrl: './header.css',
})
export class Header {
   private notificationService = inject(NotificationService);
   notifications = this.notificationService.notifications;

   constructor(
      public layoutService: LayoutService
   ) { }
}
