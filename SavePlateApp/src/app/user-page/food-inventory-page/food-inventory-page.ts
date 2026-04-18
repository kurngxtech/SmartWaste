import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService, FoodItem } from '../../services/analytics.service';

@Component({
   selector: 'app-food-inventory-page',
   standalone: true,
   imports: [CommonModule, RouterModule],
   templateUrl: './food-inventory-page.html'
})
export class FoodInventoryPageComponent implements OnInit {
   menuItems = [
      { label: 'Dashboard and Impact', icon: '📊', route: '/dashboard', active: false },
      { label: 'Food And Inventory', icon: '🍎', route: '/inventory', active: true },
      { label: 'Donation Hub', icon: '🤝', route: '/donations', active: false },
      { label: 'Meal Planner', icon: '🗓️', route: '/planner', active: false },
      { label: 'Setting', icon: '⚙️', route: '/settings', active: false }
   ];

   activeTab = 'ALL';
   allInventoryItems: FoodItem[] = [];
   filteredInventoryItems: FoodItem[] = [];

   counts = {
      all: 0,
      fridge: 0,
      pantry: 0,
      freezer: 0
   };

   constructor(private analyticsService: AnalyticsService) {}

   ngOnInit() {
      // Sync with the shared mock data
      this.allInventoryItems = this.analyticsService.getAllItems();
      
      this.counts.all = this.allInventoryItems.length;
      this.counts.fridge = this.allInventoryItems.filter(i => i.category === 'Fridge').length;
      this.counts.pantry = this.allInventoryItems.filter(i => i.category === 'Pantry').length;
      this.counts.freezer = this.allInventoryItems.filter(i => i.category === 'Freezer').length;

      this.setActiveTab('ALL');
   }

   setActiveTab(tab: string): void {
      this.activeTab = tab;
      
      if (tab === 'ALL') {
         this.filteredInventoryItems = this.allInventoryItems;
      } else {
         const categoryMap: any = { 'FRIDGE': 'Fridge', 'PANTRY': 'Pantry', 'FREEZER': 'Freezer' };
         this.filteredInventoryItems = this.allInventoryItems.filter(i => i.category === categoryMap[tab]);
      }
   }
}