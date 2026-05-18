# SavePlate App - Project Handover & Current State Analysis

**Date:** May 2026 (Iteration 1 Deadline Phase)
**Project:** SavePlate (Smart Food Waste Reduction App)
**Target:** Assignment 2 - Iteration 1 Submission

## 1. Project Overview

SavePlate is an Angular-based web application designed for Malaysian households to manage food inventory, plan meals, and donate expiring food. The project is currently wrapping up **Iteration 1** (Prototype phase), focusing on core UI, mock-data integrations, and rigorous testing documentation.

### Team Use Case (UC) Distribution:

- **Bagus (Self):** UC1 (User Registration/Auth/Settings) & UC4 (Impact Analytics)
- **Kevin:** UC2 (Inventory Management) & UC6 (Meal Planning)
- **Ari:** UC3 (Donation Browsing) & UC5 (Automated Notifications)

## 2. Technical Stack & Environment Rules

- **Framework:** Angular (Standalone Components, SSR enabled).
- **Version Lock:** Pinned to **`@angular/core@21.2.9`** across all dependencies. (Crucial: Do not update to `.10` due to `ERESOLVE` and missing `@angular/ssr` registry targets).
- **Styling:** Tailwind CSS v4 (Migrated successfully from manual `.css` files).
- **Visual Theme:** Eco-friendly dark green gradients (`bg-green-700` to `bg-green-900`), clean white/gray dashboard cards.
- **Testing Tools:**
  - **Vitest:** For Unit and Integration testing (Component logic, Services).
  - **Cypress:** Primary tool for End-to-End (E2E) Black Box testing (DOM updates, routing, auth flows).
  - **Selenium IDE:** Used minimally for specific repetitive script generation (`.side` files) required by the assignment rubric. (Note: Encountered `initKeyEvent` deprecation errors with Angular reactive forms, so Cypress is the preferred E2E tool).

## 3. Recent Development Progress (Completed)

1.  **Tailwind Migration:** Converted `meal-planner-page` and `add-meal-modal` to pure Tailwind CSS utility classes, removing manual stylesheets.
2.  **Dummy Authentication:** Configured `auth.service.ts` with a hardcoded `dummyaccount@gmail.com` to bypass backend requirements and unblock E2E login testing.
3.  **Notifications UI (UC5):** Built a dark-themed, data-driven notification center matching a provided sketch, including a "Back to Dashboard" routing button.
4.  **Placeholder Pages (UC1):** Created structural UI cards for `settings-page` and `user-detail-page` denoting "Will be continued on Iteration 2" to maintain routing integrity.

## 4. Testing & Documentation Strategy (The Excel File)

The assignment requires an Excel test tracking sheet. We have strictly separated Functional Requirements (FR) and Non-Functional Requirements (NFR), and correctly mapped the testing tools.

### A. Test Plan Strategy

| Testing Type       | Sub Testing              | Testing Approach                                | Testing Tools             |
| :----------------- | :----------------------- | :---------------------------------------------- | :------------------------ |
| **Unit Testing**   | UC1 - UC6                | White Box (Automated & Manual)                  | Vitest (Angular TestBed)  |
| **System Testing** | **FR** (Functional)      | Black Box (End-to-End User Journeys)            | Cypress & Selenium IDE    |
|                    | **NFR** (Non-Functional) | Black Box (Usability, Security, Responsiveness) | Browser DevTools & Manual |

### B. Unit Testing Rules (Vitest Focus)

- **Rule:** The Unit Testing tab _must_ contain Vitest data (TypeScript code snippets and terminal outputs), NOT Cypress code.
- **Requirement:** Tests must be split into Positive (Happy Path) and Negative (Error Handling) scenarios (e.g., "Should login successfully" vs "Should display error if email not found").

### C. System Testing Implementation

The System Testing table documents 8 distinct End-to-End flows:

- **SYS-TC01 (UC1 - FR):** End-to-End User Registration and Dashboard Login.
- **SYS-TC02 (UC2 - FR):** Adding a new food item to the inventory.
- **SYS-TC03 (UC3 - FR):** Searching and filtering the community donation hub.
- **SYS-TC04 (UC4 - FR):** Dashboard rendering of user impact statistics.
- **SYS-TC05 (UC5 - FR):** Navigating to an alert from the Notifications Center.
- **SYS-TC06 (UC6 - FR):** Creating a meal plan and reserving inventory.
- **SYS-TC07 (NFR - Usability):** Verifying Dashboard layout responsiveness on Mobile vs Desktop (via DevTools).
- **SYS-TC08 (NFR - Security):** Verifying Route Guards block unauthenticated URL access to `/dashboard`.

## 5. Submission Requirements (Iteration 1)

For the impending deadline, the following deliverables are being finalized:

1.  **Word Document (`.docx`):** Formal compilation of the test cases (using the Excel data), Test Plan, and Git collaboration evidence (push/pull/branching logs). Must be Times New Roman, Size 12, 1.5 spacing.
2.  **Presentation (`.pptx`):** Slide deck for the individual oral presentation covering the project aim, Gantt chart progress, Git usage, and a live prototype demo.
3.  **Codebase:** The Angular project pushed to GitHub (branch `BagusBranch` merged as required).

## 6. Next Steps for AI Assistant

- Assist in formatting the final `.docx` report structure.
- Help generate Vitest test case code snippets for the Unit Testing documentation.
- Provide troubleshooting for any remaining Tailwind CSS layout bugs prior to the presentation demo.
