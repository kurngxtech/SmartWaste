import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
   selector: 'app-dashboard-page',
   standalone: true,
   imports: [CommonModule, RouterModule, SideBarNavigation, Header],
   templateUrl: './dashboard-page.html'
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
   @ViewChild('impactChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
   chartInstance: Chart | null = null;

   chartData: any[] = [];
   private notificationService = inject(NotificationService);
   alerts = this.notificationService.notifications;

   get alertCount(): number {
      return this.alerts().filter(a => a.type === 'danger' || a.type === 'warning').length;
   }

   totalFoodSavedItems: number = 0;
   totalDonationsItems: number = 0;
   isLoading: boolean = true;

   // Filters
   dateRangeOptions = [6, 3, 1]; // Months
   selectedRange = 6;
   categories = ['All', 'Fridge', 'Pantry', 'Freezer'];
   selectedCategory = 'All';

   constructor(
      private analyticsService: AnalyticsService,
      private inventoryService: InventoryService,
      private cdr: ChangeDetectorRef,
      @Inject(PLATFORM_ID) private platformId: Object
   ) { }

   ngOnInit() {
      // Only fetch data in the browser — SSR has no token and produces stale zeros
      if (isPlatformBrowser(this.platformId)) {
         this.isLoading = true;
         this.analyticsService.fetchSummary().subscribe({
            next: () => {
               const data = this.analyticsService.summary();
               this.totalFoodSavedItems = data.totalUsed;
               this.totalDonationsItems = data.totalDonated;
               this.isLoading = false;
               this.cdr.detectChanges();
            },
            error: () => {
               this.isLoading = false;
               this.cdr.detectChanges();
            }
         });

         // Also load inventory so notifications populate
         this.inventoryService.loadItems().subscribe();
      }
      
      this.chartData = this.analyticsService.getMonthlyImpactChart(this.selectedRange, this.selectedCategory);
   }

   ngAfterViewInit() {
      this.renderLineChart();
   }

   ngOnDestroy() {
      if (this.chartInstance) {
         this.chartInstance.destroy();
      }
   }

   updateChart() {
      this.chartData = this.analyticsService.getMonthlyImpactChart(this.selectedRange, this.selectedCategory);
      this.renderLineChart();
   }

   setRange(months: number) {
      this.selectedRange = months;
      this.updateChart();
   }

   setCategory(category: string) {
      this.selectedCategory = category;
      this.updateChart();
   }

   renderLineChart() {
      // Only render chart if we are in the browser (not during server-side rendering)
      if (!isPlatformBrowser(this.platformId)) {
         return;
      }

      if (!this.chartCanvas) return;

      if (this.chartInstance) {
         this.chartInstance.destroy();
      }

      const labels = this.chartData.map(d => d.month);
      const dataPoints = this.chartData.map(d => parseFloat(d.totalKG));

      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      // Create Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); // Tailwind emerald-500
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      this.chartInstance = new Chart(ctx, {
         type: 'line',
         data: {
            labels: labels,
            datasets: [{
               label: 'Food Saved & Donated (KG)',
               data: dataPoints,
               borderColor: '#10B981', // emerald-500
               backgroundColor: gradient,
               borderWidth: 3,
               tension: 0.4, // Smooth curve (spline)
               fill: true,
               pointBackgroundColor: '#fff',
               pointBorderColor: '#10B981',
               pointBorderWidth: 2,
               pointRadius: 4,
               pointHoverRadius: 6,
               pointHoverBackgroundColor: '#10B981',
               pointHoverBorderColor: '#fff',
               pointHoverBorderWidth: 2
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
               legend: { display: false },
               tooltip: {
                  backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-800
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  padding: 10,
                  displayColors: false,
                  cornerRadius: 8,
               }
            },
            scales: {
               x: {
                  grid: { display: false },
                  ticks: { color: '#9CA3AF', font: { family: 'inherit' } },
                  border: { display: false }
               },
               y: {
                  grid: { color: 'rgba(243, 244, 246, 1)' }, // gray-100
                  ticks: { display: false }, // minimal y-axis
                  border: { display: false },
                  beginAtZero: true
               }
            },
            interaction: {
               intersect: false,
               mode: 'index',
            }
         }
      });
   }
}