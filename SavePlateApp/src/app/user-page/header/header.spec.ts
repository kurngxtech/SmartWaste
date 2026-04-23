import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { provideRouter } from '@angular/router';
import { LayoutService } from '../../services/layout.service';

describe('Header', () => {
   let component: Header;
   let fixture: ComponentFixture<Header>;
   let layoutService: LayoutService;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [Header],
         providers: [
            provideRouter([]),
            LayoutService
         ]
      }).compileComponents();

      fixture = TestBed.createComponent(Header);
      component = fixture.componentInstance;
      layoutService = TestBed.inject(LayoutService);
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('should call layoutService.toggleSidebar when menu button is clicked', () => {
      const toggleSpy = vi.spyOn(layoutService, 'toggleSidebar');
      
      // Select the mobile menu button (visible on small screens)
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      
      expect(toggleSpy).toHaveBeenCalled();
   });

   it('should have a link to notifications', () => {
      const links = fixture.nativeElement.querySelectorAll('button');
      let foundNotificationLink = false;
      
      links.forEach((btn: HTMLElement) => {
         if (btn.getAttribute('routerLink') === '/notifications') {
            foundNotificationLink = true;
         }
      });
      
      expect(foundNotificationLink).toBe(true);
   });

   it('should have a link to user details', () => {
      const links = fixture.nativeElement.querySelectorAll('button');
      let foundUserLink = false;
      
      links.forEach((btn: HTMLElement) => {
         if (btn.getAttribute('routerLink') === '/userDetail') {
            foundUserLink = true;
         }
      });
      
      expect(foundUserLink).toBe(true);
   });
});
