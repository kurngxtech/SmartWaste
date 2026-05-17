import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard-page';
import { provideRouter } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi, beforeAll } from 'vitest';

describe('DashboardPage', () => {
   let component: DashboardPage;
   let fixture: ComponentFixture<DashboardPage>;
   let analyticsService: AnalyticsService;
   let mockNotificationService: any;

   // Mock Canvas getContext to avoid "Not implemented" warnings in jsdom
   beforeAll(() => {
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
         createLinearGradient: vi.fn().mockReturnValue({
            addColorStop: vi.fn()
         }),
         measureText: vi.fn().mockReturnValue({ width: 0 }),
         fillRect: vi.fn(),
         beginPath: vi.fn(),
         moveTo: vi.fn(),
         lineTo: vi.fn(),
         closePath: vi.fn(),
         stroke: vi.fn(),
         fill: vi.fn(),
      }) as any;
   });

   beforeEach(async () => {
      mockNotificationService = {
         notifications: vi.fn().mockReturnValue([])
      };

      await TestBed.configureTestingModule({
         imports: [DashboardPage, NoopAnimationsModule],
         providers: [
            provideRouter([]),
            AnalyticsService,
            InventoryService,
            { provide: NotificationService, useValue: mockNotificationService }
         ]
      }).compileComponents();

      fixture = TestBed.createComponent(DashboardPage);
      component = fixture.componentInstance;
      analyticsService = TestBed.inject(AnalyticsService);
      fixture.detectChanges();
   });

   it('create the component', () => {
      expect(component).toBeTruthy();
   });

   describe('Positive Scenarios', () => {
      it('load metrics from AnalyticsService on init', () => {
         const savedKG = analyticsService.getTotalFoodSavedKG();
         const donatedKG = analyticsService.getTotalDonationsKG();
         
         expect(component.totalFoodSavedKG).toBe(savedKG);
         expect(component.totalDonationsKG).toBe(donatedKG);
      });

      it('update chart data when valid range is changed', () => {
         const initialDataCount = component.chartData.length;
         component.setRange(3);
         expect(component.selectedRange).toBe(3);
         expect(component.chartData.length).toBe(3);
      });

      it('filter chart data by valid category', () => {
         component.setCategory('Fridge');
         expect(component.selectedCategory).toBe('Fridge');
         component.chartData.forEach(d => {
            expect(d).toHaveProperty('totalKG');
         });
      });
   });

   describe('Negative Scenarios', () => {
      it('handle zero data state for metrics', () => {
         // Mocking service to return zero
         vi.spyOn(analyticsService, 'getTotalFoodSavedKG').mockReturnValue(0);
         
         // Trigger re-init logic
         component.ngOnInit();
         
         expect(component.totalFoodSavedKG).toBe(0);
      });

      it('return empty dataset for categories with no items', () => {
         // Mocking chart to return no data for a non-existent category
         vi.spyOn(analyticsService, 'getMonthlyImpactChart').mockReturnValue([]);
         
         component.setCategory('NonExistent');
         
         expect(component.chartData.length).toBe(0);
      });

      it('handle cases with no active alerts', () => {
         // mockNotificationService is already returning [] in beforeEach
         expect(component.alertCount).toBe(0);
         expect(component.alerts().length).toBe(0);
      });
   });
});
