import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPage } from './settings-page';
import { provideRouter } from '@angular/router';

describe('SettingsPage', () => {
   let component: SettingsPage;
   let fixture: ComponentFixture<SettingsPage>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [SettingsPage],
         providers: [provideRouter([])]
      }).compileComponents();

      fixture = TestBed.createComponent(SettingsPage);
      component = fixture.componentInstance;
      await fixture.whenStable();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
