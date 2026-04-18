import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';

@Component({
   selector: 'app-dashboard-page',
   standalone: true,
   imports: [CommonModule, RouterModule, SideBarNavigation],
   templateUrl: './dashboard-page.html'
})
export class DashboardPage implements OnInit {
   chartData: any[] = [];
   alerts: any[] = [];
   
   totalFoodSavedKG: number = 0;
   totalDonationsKG: number = 0;
   
   // Filters
   dateRangeOptions = [6, 3, 1]; // Months
   selectedRange = 6;
   categories = ['All', 'Fridge', 'Pantry', 'Freezer'];
   selectedCategory = 'All';

   constructor(private analyticsService: AnalyticsService) {}

   ngOnInit() {
      this.loadData();
   }

   loadData() {
      this.totalFoodSavedKG = this.analyticsService.getTotalFoodSavedKG();
      this.totalDonationsKG = this.analyticsService.getTotalDonationsKG();
      this.alerts = this.analyticsService.getAlerts();
      this.updateChart();
   }

   updateChart() {
      this.chartData = this.analyticsService.getMonthlyImpactChart(this.selectedRange, this.selectedCategory);
   }

   setRange(months: number) {
      this.selectedRange = months;
      this.updateChart();
   }

   setCategory(category: string) {
      this.selectedCategory = category;
      this.updateChart();
   }
}