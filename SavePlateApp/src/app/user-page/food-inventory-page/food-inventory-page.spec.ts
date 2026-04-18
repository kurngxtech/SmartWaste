import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodInventoryPage } from './food-inventory-page';

describe('FoodInventoryPage', () => {
  let component: FoodInventoryPage;
  let fixture: ComponentFixture<FoodInventoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodInventoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodInventoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
