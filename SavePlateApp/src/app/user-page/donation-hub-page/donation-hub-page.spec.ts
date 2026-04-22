import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationHubPage } from './donation-hub-page';

describe('DonationHubPage', () => {
  let component: DonationHubPage;
  let fixture: ComponentFixture<DonationHubPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationHubPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DonationHubPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
