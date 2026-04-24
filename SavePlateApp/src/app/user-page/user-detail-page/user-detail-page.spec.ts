import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailPage } from './user-detail-page';
import { provideRouter } from '@angular/router';

describe('UserDetailPage', () => {
   let component: UserDetailPage;
   let fixture: ComponentFixture<UserDetailPage>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [UserDetailPage],
         providers: [provideRouter([])]
      }).compileComponents();

      fixture = TestBed.createComponent(UserDetailPage);
      component = fixture.componentInstance;
      await fixture.whenStable();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
