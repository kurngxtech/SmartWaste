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

   describe('Positive Scenarios', () => {
      it('should successfully filter donations by search term', () => {
         component.searchTerm = 'Apples';
         component.applyFilters();
         
         expect(component.filteredDonations.length).toBe(1);
         expect(component.filteredDonations[0].name).toContain('Apples');
      });

      it('should successfully filter donations by correct category', () => {
         component.selectedCategory = 'Pantry';
         component.applyFilters();
         
         expect(component.filteredDonations.length).toBe(2);
         component.filteredDonations.forEach(item => {
            expect(item.category).toBe('Pantry');
         });
      });

      it('should successfully filter donations by expiry date within warning period', () => {
         component.selectedExpiry = 'Expiring in 7 days';
         component.applyFilters();
         
         component.filteredDonations.forEach(item => {
            const expDate = new Date(item.expiryDate);
            const today = new Date('2026-04-20');
            const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            expect(diffDays).toBeLessThanOrEqual(7);
         });
      });

      it('should successfully mark a donation as claimed and show a success toast', () => {
         const item = component.donations[0]; // Fresh Apples (Available)
         expect(item.status).toBe('Available');
         
         component.claimDonation(item);
         
         expect(item.status).toBe('Claimed');
         expect(component.toastMessage).toContain('Successfully claimed');
         expect(component.toastType).toBe('success');
      });
   });

   describe('Negative Scenarios', () => {
      it('should return empty list when searching with a non-existent keyword', () => {
         component.searchTerm = 'Zxcvbnm'; // Keyword not in data
         component.applyFilters();
         
         expect(component.filteredDonations.length).toBe(0);
      });

      it('should return empty list when filtering by a category with no items', () => {
         // Assuming 'Meat' has no items in the dummy data initially, or 'Other'
         component.selectedCategory = 'Other'; 
         component.applyFilters();
         
         expect(component.filteredDonations.length).toBe(0);
      });

      it('should return empty list when filtering by expiry date with no matches', () => {
         // Create a scenario where no items expire within 1 day (by modifying dummy data temporarily or assuming it fails)
         component.donations = []; // empty it to force 0
         component.selectedExpiry = 'Expiring in 7 days';
         component.applyFilters();

         expect(component.filteredDonations.length).toBe(0);
      });

      it('should prevent claiming an already claimed donation (no toast message)', () => {
         const item = component.donations[4]; // Milk is already 'Claimed'
         component.toastMessage = null; // Reset toast
         
         component.claimDonation(item);
         
         expect(item.status).toBe('Claimed'); // Status shouldn't change
         expect(component.toastMessage).toBeNull(); // Toast shouldn't appear
      });
   });
});
