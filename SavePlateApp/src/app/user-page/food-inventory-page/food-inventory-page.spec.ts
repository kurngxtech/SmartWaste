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
      imports: [FoodInventoryPageComponent, ReactiveFormsModule, FormsModule, NoopAnimationsModule],
      providers: [provideRouter([]), provideHttpClient()],
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
    component.filteredItems.forEach((item) => {
      expect(item.name.toLowerCase()).toContain('spinach');
    });
  });

  describe('E1UC2-US1: Add Food Item', () => {
    it('[Positive] User successfully adds a valid food item to the inventory', () => {
      const initialCount = component.items.length;
      component.openAddModal();
      component.addForm.patchValue({
        name: 'New Apples',
        category: 'Fruit',
        location: 'Pantry',
        quantity: 5,
        expiryDate: '2026-05-01',
        note: 'Fresh from market',
      });

      component.saveNewItem();

      expect(component.items.length).toBe(initialCount + 1);
      const added = component.items.find((i) => i.name === 'New Apples');
      expect(added).toBeTruthy();
      expect(added?.quantity).toBe(5);
      // Modal is closed after saving
      expect(component.showAddModal).toBeFalsy();
    });

    it('[Negative] No item added when form is submitted with empty/invalid fields', () => {
      const initialCount = component.items.length;
      component.openAddModal();
      component.addForm.patchValue({
        name: '',          // required – intentionally blank
        category: 'Fruit',
        location: 'Pantry',
        quantity: 0,       // min(1) – intentionally invalid
        expiryDate: '',    // required – intentionally blank
        note: '',
      });

      component.saveNewItem();

      // Inventory count must remain unchanged
      expect(component.items.length).toBe(initialCount);
      // Modal stays open so user can correct errors
      expect(component.showAddModal).toBeTruthy();
    });
  });

  describe('E1UC2-US2: Convert to Donation', () => {
    it('[Positive] User successfully converts an inventory item to a donation listing', () => {
      const target = component.items[0];
      expect(target).toBeTruthy();

      component.openDonateModal(target);
      component.donateForm.patchValue({
        pickupAvailability: 'Tomorrow 10 AM',
        note: 'Please pick up soon',
      });

      component.confirmDonation();

      const updated = component.items.find((i) => i.id === target.id);
      expect(updated?.status).toBe('Donated');
      // Donate modal dismissed after confirmation
      expect(component.showDonateModal).toBeFalsy();
    });

    it('[Negative] Status unchanged when donation is attempted without pickup details', () => {
      const target = component.items[0];
      const initialStatus = target.status;

      component.openDonateModal(target);
      component.donateForm.patchValue({
        pickupAvailability: '',  // required – intentionally blank
        note: '',
      });

      component.confirmDonation();

      const unchanged = component.items.find((i) => i.id === target.id);
      // Status must NOT change to 'Donated'
      expect(unchanged?.status).toBe(initialStatus);
      // Modal must remain open for user to fill missing details
      expect(component.showDonateModal).toBeTruthy();
    });
  });
});
