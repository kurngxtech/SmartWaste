import { TestBed } from '@angular/core/testing';

import { FoodInventory } from './food-inventory';

describe('FoodInventory', () => {
  let service: FoodInventory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodInventory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
