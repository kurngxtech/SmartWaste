import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSettingsPage } from './app-settings-page';

describe('AppSettingsPage', () => {
  let component: AppSettingsPage;
  let fixture: ComponentFixture<AppSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSettingsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSettingsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
