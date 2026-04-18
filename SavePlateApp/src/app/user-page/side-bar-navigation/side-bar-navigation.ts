import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-bar-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar-navigation.html'
})
export class SideBarNavigation {
   menuItems = [
      { label: 'Dashboard and Impact', icon: '📊', route: '/' },
      { label: 'Food And Inventory', icon: '🍎', route: '/inventory' },
      { label: 'Donation Hub', icon: '🤝', route: '/donations' },
      { label: 'Meal Planner', icon: '🗓️', route: '/planner' },
      { label: 'Setting', icon: '⚙️', route: '/settings' }
   ];

   currentUrl = '';

   constructor(private router: Router) {
      this.currentUrl = this.router.url;
      this.router.events.pipe(
         filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
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
