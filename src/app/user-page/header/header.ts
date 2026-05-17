import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { LayoutService } from '../../services/layout.service';
import { NotificationService } from '../../services/notification.service';
import { UserSettingsService } from '../../services/user-settings.service';
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
   private settingsService = inject(UserSettingsService);

   notifications = this.notificationService.notifications;
   get profile() { return this.settingsService.profile(); }

   constructor(
      public layoutService: LayoutService
   ) { }
}
