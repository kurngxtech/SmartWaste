# Sign-Up Feature Testing Summary

This document outlines the testing strategy, implementation, and progress for the `SignUpPageComponent` and `AuthService` in the SavePlate application. The testing structure covers unit, integration, and end-to-end (E2E) testing.

## 1. Component Testing
**File:** `src/app/sign-up-page/sign-up-page.spec.ts`
**Framework:** Vitest (Angular TestBed)

### Overview
Component tests verify the isolated behavior of the `SignUpPageComponent`. The `AuthService` and Angular `Router` are mocked to ensure the component's internal logic is tested independently of external services.

### Coverage
- **Component Creation:** Verifies the component initializes correctly.
- **Form Validation:** Checks that the reactive form requires all fields, enforces email formatting, and requires a minimum password length of 6.
- **Submission Logic (`onSubmit`):**
  - Mocks `AuthService.sendVerificationEmail` to return `true` for valid Google emails, transitioning the UI to verification mode.
  - Mocks `AuthService.sendVerificationEmail` to return `false` for non-Google emails, triggering the appropriate UI error.
- **Verification Logic (`onVerify`):**
  - Mocks `verifyCodeAndRegister` to succeed, verifying the Router navigates to `/login`.
  - Mocks failure, verifying the component displays an invalid code error.
- **State Reset:** Ensures `goBackToSignUp()` resets the verification state correctly.

---

## 2. Service Testing
**File:** `src/app/authentication/auth.service.spec.ts`
**Framework:** Vitest

### Overview
Service tests verify the business logic inside the `AuthService` independently from any UI components.

### Coverage
- **Service Instantiation:** Ensures the service is provided correctly in root.
- **`sendVerificationEmail`:**
  - Validates that non-Google emails (`@yahoo.com`) are rejected.
  - Validates case-insensitivity (`TEST@GMAIL.COM`).
  - Mocks `Math.random()` to ensure a predictable 6-digit code is generated and stored in the internal `pendingRegistrations` map.
- **`verifyCodeAndRegister`:**
  - Validates successful registration when the provided code matches the pending registration.
  - Ensures the user is moved from pending to the registered `users` array.
  - Rejects incorrect codes or emails with no pending requests.
- **`register` & `checkEmailExists`:** Validates direct manual registration and email existence checks.

---

## 3. Integration Testing
**File:** `src/app/sign-up-page/sign-up-page.integration.spec.ts`
**Framework:** Vitest (Angular TestBed)

### Overview
Integration tests verify that the `SignUpPageComponent` and the **real** `AuthService` work together properly. Unlike component tests, the service is not mocked, testing the boundaries between the component UI and service state.

### Coverage
- **Successful End-to-End Flow:** 
  - Fills the sign-up form, submits it, and verifies the real `AuthService` creates a pending registration.
  - Mocks `Math.random()` to predict the generated verification code.
  - Inputs the code into the verification form and asserts the Router navigates to `/login` and the real service saves the user.
- **Failed Verification:** Submits an invalid code and asserts the component blocks navigation and the service drops the registration.
- **Provider Rejection:** Uses a non-Google email and asserts the component halts progression and no pending registration is created in the service.

---

## 4. End-to-End (E2E) Testing
**File:** `cypress/e2e/sign-up.cy.ts`
**Framework:** Cypress

### Overview
E2E tests run in a real browser, simulating actual user interactions against a running Angular development server (`http://localhost:4200`). 

### Coverage
- **UI Rendering:** Verifies all form inputs and disabled submit buttons render on load.
- **Real-time Validation:** Triggers blur events to ensure UI error messages appear for empty names, invalid emails, short passwords, and invalid household sizes.
- **Non-Google Rejection:** Types a `@yahoo.com` email, clicks submit, and verifies the on-screen error banner appears.
- **Verification Transition:** Types a valid `@gmail.com` email, submits, and ensures the DOM updates to show the verification input and correct email text.
- **Navigation Options:** Verifies the "Back to Sign Up" button returns the user to the initial form.
- **Incorrect Verification Code:** Types an invalid 6-digit code into the verification UI and asserts the error banner appears correctly.

*(Note: Successful E2E verification login is bypassed here as it requires backend interception to grab the randomly generated code, which is handled in Integration testing).*

---

### Execution Commands
To run the respective test suites:
- **Unit/Integration Tests:** `npm run test` or `ng test`
- **Cypress E2E Tests:** `npx cypress open` (requires the Angular dev server to be running on port 4200)
