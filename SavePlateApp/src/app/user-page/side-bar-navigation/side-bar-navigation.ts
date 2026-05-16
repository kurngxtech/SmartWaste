import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../../services/layout.service';
import { UserSettingsService } from '../../services/user-settings.service';

@Component({
   selector: 'app-side-bar-navigation',
   standalone: true,
   imports: [CommonModule, RouterModule],
   templateUrl: './side-bar-navigation.html',
})
export class SideBarNavigation {
   settingsService = inject(UserSettingsService);
   get profile() { return this.settingsService.profile(); }

   menuItems = [
      { label: 'Dashboard and Impact', icon: '/app-logo/dashboard.ico', route: '/dashboard' },
      { label: 'Food And Inventory', icon: '/app-logo/diet.ico', route: '/inventory' },
      { label: 'Donation Hub', icon: '/app-logo/food-donation-navbar.ico', route: '/donations' },
      { label: 'Meal Planner', icon: '/app-logo/planner.ico', route: '/planner' },
      { label: 'Settings', icon: '/app-logo/gear.ico', route: '/appSettings' },
   ];

   currentUrl = '';

   constructor(private router: Router, public layoutService: LayoutService) {
      this.currentUrl = this.router.url;
      this.router.events
         .pipe(filter((event) => event instanceof NavigationEnd))
         .subscribe((event: any) => {
            this.currentUrl = event.urlAfterRedirects;
         });
   }

   isActive(route: string): boolean {
      if (route === '/') {
         return this.currentUrl === '/' || this.currentUrl === '/dashboard';
      }
      return this.currentUrl.includes(route);
   }
}
