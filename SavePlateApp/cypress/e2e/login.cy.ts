/// <reference types="cypress" />

describe('Login Flow', () => {
   const dummyEmail = 'dummyaccount@gmail.com';
   const dummyPassword = 'dummy1234!';

   beforeEach(() => {
      // Assuming the app is running on localhost:4200
      cy.visit('http://localhost:4200/login');
   });

   it('should display the login page correctly', () => {
      cy.get('h1').should('contain', 'LOGIN');
      cy.get('form').should('be.visible');
   });

   it('should show validation errors on empty fields', () => {
      cy.get('#email').focus().blur();
      cy.get('#password').focus().blur();

      cy.contains('Email is required.').should('be.visible');
      cy.contains('Password is required.').should('be.visible');
   });

   it('should successfully login with dummy account', () => {
      cy.get('#email').type(dummyEmail);
      cy.get('#password').type(dummyPassword);

      cy.get('button[type="submit"]').should('not.be.disabled').click();

      // Assert redirection to dashboard
      cy.url().should('include', '/dashboard');

      // Verify dashboard content to ensure login was successful
      cy.get('h1').should('contain', 'Impact Analysis');
   });

   it('should show error message for non-existent email', () => {
      cy.get('#email').type('nonexistent@gmail.com');
      cy.get('#password').type('wrongpass123');

      cy.get('button[type="submit"]').click();

      cy.contains('The email you used does not exist.').should('be.visible');
      cy.get('a[routerLink="/signup"]').should('be.visible');
   });
});
