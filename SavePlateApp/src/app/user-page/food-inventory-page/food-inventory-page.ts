import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService, FoodItem } from '../../services/analytics.service';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';

@Component({
   selector: 'app-food-inventory-page',
   standalone: true,
   imports: [CommonModule, RouterModule, SideBarNavigation],
   templateUrl: './food-inventory-page.html'
})
export class FoodInventoryPageComponent implements OnInit {
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