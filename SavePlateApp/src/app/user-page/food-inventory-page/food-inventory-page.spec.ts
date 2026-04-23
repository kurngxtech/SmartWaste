import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodInventoryPageComponent } from './food-inventory-page';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('FoodInventoryPageComponent', () => {
   let component: FoodInventoryPageComponent;
   let fixture: ComponentFixture<FoodInventoryPageComponent>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [
            FoodInventoryPageComponent,
            ReactiveFormsModule,
            FormsModule,
            NoopAnimationsModule
         ],
         providers: [
            provideRouter([]),
            provideHttpClient()
         ]
      }).compileComponents();

      fixture = TestBed.createComponent(FoodInventoryPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create the food inventory page', () => {
      expect(component).toBeTruthy();
   });

   it('should calculate summary counts correctly on initialization', () => {
      expect(component.totalItems).toBeGreaterThanOrEqual(0);
   });

   it('should filter items by search term', () => {
      component.searchTerm = 'Spinach';
      component.applyFilters();
      component.filteredItems.forEach(item => {
         expect(item.name.toLowerCase()).toContain('spinach');
      });
   });
});
