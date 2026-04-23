import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonationHubPage } from './donation-hub-page';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DonationHubPage', () => {
   let component: DonationHubPage;
   let fixture: ComponentFixture<DonationHubPage>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [DonationHubPage, FormsModule, NoopAnimationsModule],
         providers: [provideRouter([])]
      }).compileComponents();

      fixture = TestBed.createComponent(DonationHubPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('should filter donations by search term', () => {
      component.searchTerm = 'Apples';
      component.applyFilters();
      
      expect(component.filteredDonations.length).toBe(1);
      expect(component.filteredDonations[0].name).toContain('Apples');
   });

   it('should filter donations by category', () => {
      component.selectedCategory = 'Pantry';
      component.applyFilters();
      
      expect(component.filteredDonations.length).toBe(2);
      component.filteredDonations.forEach(item => {
         expect(item.category).toBe('Pantry');
      });
   });

   it('should filter donations by expiry date (7 days)', () => {
      component.selectedExpiry = 'Expiring in 7 days';
      component.applyFilters();
      
      component.filteredDonations.forEach(item => {
         const expDate = new Date(item.expiryDate);
         const today = new Date('2026-04-20');
         const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
         expect(diffDays).toBeLessThanOrEqual(7);
      });
   });

   it('should mark a donation as claimed and show a toast', () => {
      const item = component.donations[0]; // Fresh Apples
      expect(item.status).toBe('Available');
      
      component.claimDonation(item);
      
      expect(item.status).toBe('Claimed');
      expect(component.toastMessage).toContain('Successfully claimed Fresh Apples');
      expect(component.toastType).toBe('success');
   });

   it('should not allow claiming an already claimed donation', () => {
      const item = component.donations[4]; // Milk is already 'Claimed'
      component.toastMessage = null;
      
      component.claimDonation(item);
      
      expect(component.toastMessage).toBeNull();
   });
});
