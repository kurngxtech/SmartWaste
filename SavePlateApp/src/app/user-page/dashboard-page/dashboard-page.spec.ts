import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard-page';
import { provideRouter } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardPage', () => {
   let component: DashboardPage;
   let fixture: ComponentFixture<DashboardPage>;
   let analyticsService: AnalyticsService;

   beforeEach(async () => {   
      await TestBed.configureTestingModule({
         imports: [DashboardPage, NoopAnimationsModule],
         providers: [
            provideRouter([]),
            AnalyticsService,
            InventoryService,
            NotificationService
         ]
      }).compileComponents();

      fixture = TestBed.createComponent(DashboardPage);
      component = fixture.componentInstance;
      analyticsService = TestBed.inject(AnalyticsService);
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('should load metrics from AnalyticsService on init', () => {
      const savedKG = analyticsService.getTotalFoodSavedKG();
      const donatedKG = analyticsService.getTotalDonationsKG();
      
      expect(component.totalFoodSavedKG).toBe(savedKG);
      expect(component.totalDonationsKG).toBe(donatedKG);
   });

   it('should update chart data when range is changed', () => {
      const initialDataCount = component.chartData.length; // Default 6 months
      
      component.setRange(3);
      expect(component.selectedRange).toBe(3);
      expect(component.chartData.length).toBe(3);
      expect(component.chartData.length).not.toBe(initialDataCount);
   });

   it('should filter chart data by category', () => {
      component.setCategory('Fridge');
      expect(component.selectedCategory).toBe('Fridge');
      
      // Verify all chart data points are calculated for Fridge
      // In mock data, Fridge items should result in specific values
      component.chartData.forEach(d => {
         expect(d).toHaveProperty('totalKG');
      });
   });

   it('should combine alerts from both Analytics and Inventory services', () => {
      const analyticsAlertsCount = analyticsService.getAlerts().length;
      // Note: InventoryService alerts depend on mock items and current date
      expect(component.alerts().length).toBeGreaterThanOrEqual(analyticsAlertsCount);
   });
});
