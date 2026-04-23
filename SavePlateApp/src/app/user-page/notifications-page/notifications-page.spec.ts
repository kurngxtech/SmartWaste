import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsPage } from './notifications-page';
import { provideRouter } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationsPage', () => {
   let component: NotificationsPage;
   let fixture: ComponentFixture<NotificationsPage>;
   let inventoryService: InventoryService;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [NotificationsPage, NoopAnimationsModule],
         providers: [
            provideRouter([]),
            InventoryService
         ]
      }).compileComponents();

      fixture = TestBed.createComponent(NotificationsPage);
      component = fixture.componentInstance;
      inventoryService = TestBed.inject(InventoryService);
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('should load notifications from InventoryService', () => {
      const expectedCount = inventoryService.getNotifications().length;
      expect(component.notifications.length).toBe(expectedCount);
   });

   it('should have notification properties (id, title, type)', () => {
      if (component.notifications.length > 0) {
         const first = component.notifications[0];
         expect(first).toHaveProperty('id');
         expect(first).toHaveProperty('title');
         expect(first).toHaveProperty('type');
      }
   });
});
