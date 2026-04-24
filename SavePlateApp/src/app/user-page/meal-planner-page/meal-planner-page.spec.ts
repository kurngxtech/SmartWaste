import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MealPlannerPage } from './meal-planner-page';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MealPlannerPage', () => {
  let component: MealPlannerPage;
  let fixture: ComponentFixture<MealPlannerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlannerPage, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MealPlannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the meal planner page', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with weekOffset at 0', () => {
    expect(component.weekOffset()).toBe(0);
  });

  it('should increment weekOffset when changeWeek(1) is called', () => {
    component.changeWeek(1);
    expect(component.weekOffset()).toBe(1);
  });

  it('should reset weekOffset to 0 when goToday() is called', () => {
    component.changeWeek(5);
    component.goToday();
    expect(component.weekOffset()).toBe(0);
  });

  it('should format dates correctly for cell filtering', () => {
    const testDate = new Date(2026, 3, 20); // April 20, 2026
    const plans = component.getPlansForCell(testDate, 'Breakfast');
    expect(plans.length).toBeGreaterThan(0);
    expect(plans[0].name).toBe('Spinach Omelette');
  });
});
