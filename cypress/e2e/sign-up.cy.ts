/// <reference types="cypress" />

describe('Sign Up Page E2E Tests', () => {
   const dummyEmail = 'dummyaccount@gmail.com';
   const fixedCode = '211110'; // Result of Math.random stub (0.123456)

   beforeEach(() => {
      // Visit the sign up page and stub Math.random to make verification code predictable
      cy.visit('http://localhost:4200/signup', {
         onBeforeLoad(win) {
            cy.stub(win.Math, 'random').returns(0.123456);
         }
      });
   });

   it('should display the sign up form', () => {
      cy.get('h1').should('contain', 'Sign Up');
      cy.get('input#fullName').should('be.visible');
      cy.get('input#email').should('be.visible');
      cy.get('input#password').should('be.visible');
      cy.get('input#householdSize').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled'); 
   });

   it('should show validation errors on invalid inputs', () => {
      cy.get('input#fullName').focus().blur();
      cy.contains('Full name is required.').should('be.visible');

      cy.get('input#email').type('invalid-email').blur();
      cy.contains('Please enter a valid email.').should('be.visible');

      cy.get('input#password').type('123').blur();
      cy.contains('Minimum 6 characters.').should('be.visible');

      cy.get('input#householdSize').type('0').blur();
      cy.contains('Must be at least 1.').should('be.visible');

      cy.get('button[type="submit"]').should('be.disabled');
   });

   it('should reject non-Google emails', () => {
      cy.get('input#fullName').type('Dummy User');
      cy.get('input#email').type('testuser@yahoo.com');
      cy.get('input#password').type('dummy1234!');
      cy.get('input#householdSize').type('2');

      cy.get('button[type="submit"]').should('not.be.disabled').click();

      cy.contains('Please use a valid Google (@gmail.com) email account.').should('be.visible');
      cy.get('h1').should('contain', 'Sign Up'); 
   });

   it('should transition to verification mode with a valid Google email', () => {
      cy.get('input#fullName').type('Dummy User');
      cy.get('input#email').type(dummyEmail);
      cy.get('input#password').type('dummy1234!');
      cy.get('input#householdSize').type('2');

      cy.get('button[type="submit"]').click();

      cy.get('h1').should('contain', 'Email Verification');
      cy.contains("We've sent a 6-digit code to").should('be.visible');
      cy.contains(dummyEmail).should('be.visible');

      cy.get('input#code').should('be.visible');
   });

   it('should successfully register with a correct verification code', () => {
      // 1. Fill out Sign Up
      cy.get('input#fullName').type('Dummy User');
      cy.get('input#email').type(dummyEmail);
      cy.get('input#password').type('dummy1234!');
      cy.get('input#householdSize').type('2');
      cy.get('button[type="submit"]').click();

      // 2. Input the fixed verification code
      cy.get('input#code').type(fixedCode);
      cy.get('button').contains('Verify Account').should('not.be.disabled').click();

      // 3. Should redirect to login
      cy.url().should('include', '/login');
      cy.contains('LOGIN').should('be.visible');
   });

   it('should show an error when entering an incorrect verification code', () => {
      cy.get('input#fullName').type('Dummy User');
      cy.get('input#email').type(dummyEmail);
      cy.get('input#password').type('dummy1234!');
      cy.get('input#householdSize').type('2');
      cy.get('button[type="submit"]').click();

      // Enter a wrong code
      cy.get('input#code').type('000000');
      cy.get('button').contains('Verify Account').click();

      cy.contains('Invalid verification code.').should('be.visible');
   });

   it('should allow user to go back to sign up from verification mode', () => {
      cy.get('input#fullName').type('Dummy User');
      cy.get('input#email').type(dummyEmail);
      cy.get('input#password').type('dummy1234!');
      cy.get('input#householdSize').type('2');
      cy.get('button[type="submit"]').click();

      cy.get('button').contains('Back to Sign Up').click();

      // Should be back on the sign up form with data preserved or reset (depending on component logic)
      cy.get('h1').should('contain', 'Sign Up');
      cy.get('input#fullName').should('have.value', 'Dummy User');
   });
});
