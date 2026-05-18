# SavePlateApp: Deep Analysis & Architectural Overview

## 1. Project Overview & Context
**SavePlate** is a web-based prototype designed as a "Smart Food Waste Reduction App" aimed at assisting Malaysian households in managing food inventory, avoiding waste, and potentially facilitating food donation. The current focus is on building out Iteration 1 of the app, ensuring user data privacy, and fostering sustainable consumption habits.

- **Objective**: Develop a functional, responsive web application that tracks inventory, provides expiry alerts, and helps users plan their meals to reduce food waste.
- **Target Audience**: Malaysian households.
- **Project Deadlines**: 
  - Iteration 1 Submission: April 25, 2026
  - Iteration 2 Submission (Final): May 23, 2026

## 2. Technical Stack & Dependencies Analysis
Based on the project's configurations and `package.json`, SavePlateApp is leveraging a highly modern, full-stack ecosystem:

### Frontend
- **Framework**: **Angular 21.2.0** utilizing Standalone Components (indicating modern, less-boilerplate Angular patterns without NgModules).
- **Styling**: **Tailwind CSS 4.2.x** with PostCSS, following a "sustainability" theme characterized by deep green gradients (`bg-green-700` to `bg-green-900`), and clean white/gray backgrounds.
- **Data Visualization**: **Chart.js** integration for rendering impact analytics and statistics on the Dashboard.
- **SSR (Server-Side Rendering)**: `@angular/ssr` and Express are included, indicating that the app uses Angular Universal/SSR for better SEO, faster initial paint, and robust link previewing.

### Backend (Planned/Ongoing)
- **Runtime**: **Node.js** with **Express.js**.
- **Database**: Relational mapping (PostgreSQL intended) with UUID-based primary keys to guarantee robust security and uniqueness across distributed entities.
- **Architecture Level**: A standard Three-Tier system (Presentation, Logic, Persistence).

### Testing & Quality Assurance
- **Unit/Integration Testing**: **Vitest** (modern, very fast, ESM-native alternative to Karma/Jasmine).
- **End-to-End (E2E) Testing**: **Cypress** is configured to run actual browser interaction workflows, particularly emphasizing auth flows (UC1).
- **Mock-First approach**: Currently, data relies on mock implementations (e.g., hardcoded JSON) while backend services are developed, allowing the frontend team to maintain velocity.

## 3. Deep Analytic of Current State & Work Breakdown
The project assigns specific Use Cases (UC) to team members:
1. **Self (UC1 & UC4)**: Responsible for User Registration/Auth (UC1) and Impact Analytics (UC4). Significant progress is made on reactive forms with mock validation, and the Analytics dashboard UI using CSS-based graphing and Chart.js.
2. **Kevin (UC2 & UC6)**: Dealing with Food Inventory Management and Weekly Meal Planning.
3. **Ari (UC3 & UC5)**: Focusing on the Community Food Browsing (donations) and Automated Notifications system for expiring items.

**Current Routing Architecture (`app.routes.ts`)**:
- `/` -> `LoginPageComponent`
- `/register` -> `SignUpPageComponent`
- `/dashboard` -> `DashboardPageComponent`

The design philosophy splits these routes elegantly:
- The **Login** uses a 70/30 split layout.
- The **Sign-Up** utilizes a 35/30/35 layout.
- The **Dashboard** acts as an application shell with a fixed sidebar, a top navbar, and dynamically loaded main content hooks to support the other developers' modules.

## 4. Conclusion & Strategic Recommendations

**Conclusion**:
SavePlateApp is currently in a healthy, fast-paced prototyping stage. The choice of Angular 21 with Standalone Components and Tailwind CSS ensures the codebase remains modular, maintainable, and highly responsive. The "Mock-First" approach implemented for the dashboard's analytics guarantees that UI/UX iterations are not blocked by backend bottlenecks. Testing coverage strategy is sound, splitting unit concerns to Vitest and E2E to Cypress.

**Recommendations for Next Steps**:
1. **Backend Integration**: Prioritize transitioning the mock authentication (UC1) to the actual `POST /api/auth/register` endpoint using the Express layer. This will validate the data flow from the Client Node to the Database Server.
2. **Component Pluggability**: Ensure that the Dashboard Shell strictly defines its `@Input()` and `@Output()` interfaces or utilizes global state management (like NgRx or Signals) so that Kevin and Ari's modules can seamlessly mount without disrupting the UI layout.
3. **Responsive Testing**: With Tailwind CSS implemented, continuous verification across mobile dimensions (specifically checking the fixed Sidebar behaviors on smaller screens) should be conducted prior to the Iteration 1 demo on April 25.
4. **Data Synchronization**: Given the SSR capability, ensure state transfer from server to client is hydrated correctly to avoid UI flickering, especially on the Dashboard's Analytics load.

## 5. Testing Tools & Feature Coverage Analysis

The application enforces a rigorous testing standard across all primary pages using three specific testing tools: **Vitest**, **Cypress**, and **Selenium IDE**. 

### 1. Vitest (Unit & Integration Testing)
Vitest is heavily utilized as the primary runner for isolated component testing and integration with Angular Services.
- **Sign-Up Page (`SignUpPageComponent`) & Authentication:**
  - Component Tests: Ensures UI validation rules (required fields, email format, password length) and mock verification logic triggers the right UI states.
  - Integration Tests: Verifies the interaction with the *real* `AuthService` (e.g., creating a pending registration, inputting generated verification codes).
  - Service Tests (`AuthService`): Ensures business logic independent of UI, verifying Google email constraints, verification code generation, and manual registration.
- **Meal Planner Page:**
  - Integration: Verifies calendar UI fetches and displays exact dates from `MealPlannerService`, preventing meals from bleeding into incorrect weeks.
- **Food Inventory Page:**
  - Integration: Tests the features "Mark as Used", "Plan for Meal", and search/filter mechanisms via `InventoryService`.
- **Donation Hub Page:**
  - Integration: Tests the "Claim" workflow and ensures real-time lists exclude expired or claimed items.
- **Dashboard:**
  - Integration: Ensures Analytics metric logic correctly calculates data and handles empty states gracefully via `AnalyticsService`.

### 2. Cypress (End-to-End Testing)
Cypress is used for real-browser user journey automation running against the Angular development server (`http://localhost:4200`).
- **Sign-Up & Login Flows:**
  - Automates typing in valid/invalid credentials.
  - Verifies DOM updates such as UI error banners for `@yahoo.com` emails, transitions to the verification code input, and the functionality of the "Back to Sign Up" button.
- **Navigation Flow:**
  - Verifies the user journey moving across the Dashboard Sidebar, Header, and toggling the mobile responsive Burger menu.

### 3. Selenium (Automated Browser Actions)
A specific Selenium IDE `.side` project is used for isolated browser automation routines.
- **Login Flow (`login-test`):** Automates the login process using `dummyaccount@gmail.com`.
- **Inventory Management (`add-food-item` & `edit-food-item`):**
  - Automates clicking "Add item", filling form data (e.g., "Pokcoy", quantity, expiry dates), and saving.
  - Automates the "Edit" process by modifying an existing item's quantity and expiry date within the Inventory UI.

**Testing Health:** The project currently maintains a 100% success rate across all Vitest tests (56 Passed) and Cypress tests (8 Passed) for Iteration 1 features.
