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
      providers: [provideRouter([]), provideHttpClient()],
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

  // ─── Epic 2: Use Case 6 – Weekly Meal Planning and Ingredient Optimization ──

  describe('TCK2: Assign Meal to Calendar Slot', () => {
    it('[Positive] User successfully assigns a meal to a slot and plan count increases', () => {
      const initialCount = component.plannedCount();
      component.openModal('Mon', 'Breakfast');
      component.onSaveMeal({
        name: 'Oatmeal',
        day: 'Mon',
        slot: 'Breakfast',
        date: '2026-04-20',
        ingredients: [],
        reminderEnabled: true,
      });

      expect(component.plannedCount()).toBe(initialCount + 1);
      expect(component.showModal()).toBeFalsy();
    });

    it('[Negative] Modal remains accessible; plan count unchanged when user cancels instead of saving', () => {
      const initialCount = component.plannedCount();
      component.openModal('Mon', 'Breakfast');
      expect(component.showModal()).toBeTruthy();
      component.onCloseModal();

      expect(component.plannedCount()).toBe(initialCount);
      expect(component.showModal()).toBeFalsy();
    });
  });

  describe('TCK2: Recipe Suggestions from Expiring Ingredients', () => {
    it('[Positive] System returns recipe suggestions that utilise expiring ingredients', () => {
      const suggestions = component.suggestions();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].name).toBeTruthy();
      expect(typeof suggestions[0].usesExpiring).toBe('boolean');
      expect(suggestions[0].matchedIngredients.length).toBeGreaterThan(0);
    });

    it('[Negative] User can still manually create a meal plan when no recipe suggestions are available', () => {
      component.openModal('Wed', 'Dinner');
      expect(component.showModal()).toBeTruthy();

      component.onSaveMeal({
        name: 'Custom Pasta',
        day: 'Wed',
        slot: 'Dinner',
        date: '2026-04-22',
        ingredients: [],
        reminderEnabled: false,
      });

      const plans = component.getPlansForCell(new Date(2026, 3, 22), 'Dinner');
      expect(plans.some((p) => p.name === 'Custom Pasta')).toBe(true);
      expect(component.showModal()).toBeFalsy();
    });
  });
});
