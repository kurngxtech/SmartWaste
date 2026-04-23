/// <reference types="cypress" />

describe('Sidebar Navigation E2E', () => {
   beforeEach(() => {
      // Login first to access the authenticated pages
      cy.visit('http://localhost:4200/login');
      cy.get('#email').type('dummyaccount@gmail.com');
      cy.get('#password').type('dummy1234!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
   });

   it('should navigate to Food And Inventory page', () => {
      cy.contains('Food And Inventory').click();
      cy.url().should('include', '/inventory');
      cy.get('h1').should('contain', 'Food & Inventory');
   });

   it('should navigate to Donation Hub page', () => {
      cy.contains('Donation Hub').click();
      cy.url().should('include', '/donations');
      cy.get('h1').should('contain', 'Donation Hub');
   });

   it('should navigate to Meal Planner page', () => {
      cy.contains('Meal Planner').click();
      cy.url().should('include', '/planner');
      cy.get('h1').should('contain', 'Meal Planner');
   });

   it('should toggle sidebar visibility in mobile view', () => {
      // Change viewport to iPhone 
      cy.viewport('iphone-x');

      // Target the 'aside' tag inside the component
      cy.get('aside').should('not.be.visible');

      // Click burger menu in Header
      cy.get('header button').first().click();

      // Sidebar should now be visible
      cy.get('aside').should('be.visible');
   });
});
