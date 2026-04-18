import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
   selector: 'app-dashboard-page',
   standalone: true,
   imports: [CommonModule, RouterModule],
   templateUrl: './dashboard-page.html'
})
export class DashboardPage {
   // Navigation Menu Items
   menuItems = [
      { label: 'Dashboard and Impact', icon: '📊', route: '/dashboard', active: true },
      { label: 'Food And Inventory', icon: '🍎', route: '/inventory', active: false },
      { label: 'Donation Hub', icon: '🤝', route: '/donations', active: false },
      { label: 'Meal Planner', icon: '🗓️', route: '/planner', active: false },
      { label: 'Setting', icon: '⚙️', route: '/settings', active: false }
   ];

   // Mock Data for the CSS Bar Chart
   chartData = [
      { month: 'Jan', height: '40%' },
      { month: 'Feb', height: '60%' },
      { month: 'Mar', height: '35%' },
      { month: 'Apr', height: '80%' },
      { month: 'May', height: '100%' }
   ];

   // Mock Data for Alerts
   alerts = [
      { title: 'EXPIRING ITEM', subtitle: 'Milk expires in 2 days' },
      { title: 'EXPIRING ITEM', subtitle: 'Bread expires tomorrow' },
      { title: 'DONATION UPDATE', subtitle: 'Your listing was claimed' }
   ];
}