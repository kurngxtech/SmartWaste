import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideBarNavigation } from './side-bar-navigation';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { Subject } from 'rxjs';

describe('SideBarNavigation', () => {
   let component: SideBarNavigation;
   let fixture: ComponentFixture<SideBarNavigation>;
   let router: Router;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [SideBarNavigation],
         providers: [
            provideRouter([]),
            LayoutService
         ]
      }).compileComponents();

      fixture = TestBed.createComponent(SideBarNavigation);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('should have all required menu items', () => {
      const labels = component.menuItems.map(m => m.label);
      expect(labels).toContain('Dashboard and Impact');
      expect(labels).toContain('Food And Inventory');
      expect(labels).toContain('Donation Hub');
      expect(labels).toContain('Meal Planner');
      expect(labels).toContain('Settings');
   });

   it('should correctly identify active route for dashboard', () => {
      // Manually set currentUrl to simulate being on dashboard
      // (The component logic uses this.router.url initially, then updates via events)
      (component as any).currentUrl = '/dashboard';
      expect(component.isActive('/dashboard')).toBe(true);
   });

   it('should correctly identify active route for sub-paths', () => {
      (component as any).currentUrl = '/inventory/add';
      expect(component.isActive('/inventory')).toBe(true);
   });

   it('should update currentUrl on navigation end', async () => {
      // Simulate a navigation end event
      const newUrl = '/planner';
      const event = new NavigationEnd(1, newUrl, newUrl);
      
      // Access the private router events and emit
      // Since we are using the real Router from provideRouter, we can't easily push to its events
      // But we can trigger navigation or manually call the logic
      
      // Let's manually trigger the update logic by emitting on the router's event stream if possible
      // or just verify the subscription logic by setting the property
      
      (router.events as Subject<any>).next(event);
      expect(component.currentUrl).toBe(newUrl);
   });
});
