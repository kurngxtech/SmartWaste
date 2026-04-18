/// <reference types="cypress" />

describe('Sign Up Page E2E Tests', () => {
   beforeEach(() => {
      // Visit the sign up page before each test
      cy.visit('http://localhost:4200/signup');
   });

   it('should display the sign up form', () => {
      cy.get('h1').should('contain', 'Sign Up');
      cy.get('input#fullName').should('be.visible');
      cy.get('input#email').should('be.visible');
      cy.get('input#password').should('be.visible');
      cy.get('input#householdSize').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled'); // Disabled because form is initially invalid
   });

   it('should show validation errors on invalid inputs', () => {
      // Touch inputs and blur to trigger touched state errors
      cy.get('input#fullName').focus().blur();
      cy.contains('Full name is required.').should('be.visible');

      cy.get('input#email').type('invalid-email').blur();
      cy.contains('Please enter a valid email.').should('be.visible');

      cy.get('input#password').type('123').blur();
      cy.contains('Minimum 6 characters.').should('be.visible');

      cy.get('input#householdSize').type('0').blur();
      cy.contains('Must be at least 1.').should('be.visible');

      // The submit button should still be disabled
      cy.get('button[type="submit"]').should('be.disabled');
   });

   it('should reject non-Google emails', () => {
      cy.get('input#fullName').type('Test User');
      cy.get('input#email').type('testuser@yahoo.com');
      cy.get('input#password').type('password123');
      cy.get('input#householdSize').type('2');

      // Form should be valid now, button enabled
      cy.get('button[type="submit"]').should('not.be.disabled').click();

      // Verify error message for non-Google email
      cy.contains('Please use a valid Google (@gmail.com) email account.').should('be.visible');
      cy.get('h1').should('contain', 'Sign Up'); // Still on sign up form
   });

   it('should transition to verification mode with a valid Google email', () => {
      cy.get('input#fullName').type('E2E Test User');
      cy.get('input#email').type('e2e.test@gmail.com');
      cy.get('input#password').type('password123');
      cy.get('input#householdSize').type('4');

      cy.get('button[type="submit"]').click();

      // Should transition to verification page
      cy.get('h1').should('contain', 'Email Verification');
      cy.contains("We've sent a 6-digit code to").should('be.visible');
      cy.contains('e2e.test@gmail.com').should('be.visible');

      // Verification form elements should be present
      cy.get('input#code').should('be.visible');
      cy.contains('Verify Account').should('be.disabled'); // Button disabled initially
   });

   it('should allow user to go back to sign up from verification mode', () => {
      // Fill out sign up form
      cy.get('input#fullName').type('E2E Test User');
      cy.get('input#email').type('e2e.test@gmail.com');
      cy.get('input#password').type('password123');
      cy.get('input#householdSize').type('4');
      cy.get('button[type="submit"]').click();

      // Ensure we are in verification mode
      cy.get('h1').should('contain', 'Email Verification');

      // Click 'Back to Sign Up'
      cy.contains('Back to Sign Up').click();

      // Should be back on the sign up form
      cy.get('h1').should('contain', 'Sign Up');
   });

   it('should show an error when entering an incorrect verification code', () => {
      // Fill out sign up form
      cy.get('input#fullName').type('E2E Test User');
      cy.get('input#email').type('e2e.test@gmail.com');
      cy.get('input#password').type('password123');
      cy.get('input#householdSize').type('4');
      cy.get('button[type="submit"]').click();

      // Enter a wrong 6-digit code
      cy.get('input#code').type('000000');

      // Submit verification
      cy.contains('Verify Account').click();

      // Verify error message
      cy.contains('Invalid verification code. Please try again.').should('be.visible');
   });

   // Note: Testing successful verification in E2E when the code is randomly generated 
   // on the backend/service layer usually requires intercepting/mocking the service call 
   // or fetching the code from a test endpoint. 
   // Since the code is randomly generated internally by Math.random in AuthService, 
   // we could mock the random generator, but Cypress runs in the browser context.
});
