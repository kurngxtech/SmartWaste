SavePlate Project Context: Iteration 1
1. Project Overview & Motivation

    Project Name: SavePlate – Smart Food Waste Reduction App.

    Mission: To reduce household food waste through intelligent inventory management, expiry alerts, and community donation facilitation.

    Target Audience: Malaysian households, specifically individuals managing food at home for themselves or others.

    Key Goals:

        Develop a web-based prototype within 8–10 weeks.

        Implement secure data management with Two-Factor Authentication (2FA).

        Create an intelligent tracking system for expiration notifications.

2. Technical Stack & Architecture

    Platform: Responsive Web-based application.

    Frontend: Angular (v21.0.4) with Tailwind CSS for styling.

    Backend: Node.js for server-side logic and database management.

    Database: Structured relational database (Users, Inventory, Donations, MealPlans).

    Deployment: Client Node (Angular SPA), Logic Layer (Node.js API Gateway), and Data Tier (Persistence Layer).

3. UI/UX Design Language

    Theme: Modern, eco-friendly sustainability theme.

    Palette: Deep green-based palette (e.g., bg-green-700 to bg-green-900 gradients) with white accents.

    Layout Standards:

        Login: Two-column desktop (70% image placeholder / 30% form), full-width mobile.

        Sign-Up: Three-column desktop (35% img / 30% form / 35% img), full-width mobile.

4. Current Implementation Progress
A. Routing Configuration (app.routes.ts)

The root path is configured to load the Login page, with /register leading to the Sign-Up page.
B. Login Page Component

    Functionality: Reactive Forms with validation for email (required + format) and password (required + min-length 6).

    Features: "Remember Me" checkbox and "Forgot Password" subtle link.

C. Sign-Up Page Component

    Functionality: Reactive Forms capturing Full Name, Email, Password, and Household Size.

    Validation: * Full Name: Required.

        Email: Required + Valid format.

        Password: Required + Min-length 6.

        Household Size: Required + Positive integer.

5. Testing Strategy

    Framework: Jasmine (assertions) and Karma (test runner).

    Scope: Must cover Positive (Happy Path) and Negative (Error Handling) scenarios for each User Story.

    Status: Unit test structures are initialized (.spec.ts files generated) for Auth components.

6. Project Schedule & Milestones

    Current Phase: Iteration 1 (Coding & Testing).

    Internal Progress Deadline: April 23, 2026.

    Milestone 3 (Iteration 1 Submission): April 25, 2026.

    Milestone 4 (Final Prototype Submission): May 23, 2026.

7. Development Guidelines

    CSS: Use Tailwind utility classes exclusively; avoid external CSS files.

    Components: Utilize Angular Standalone Components for modularity.

    Form Handling: Use FormBuilder and ReactiveFormsModule for all data entry.

    Git: Frequent atomic commits on separate feature branches before merging to main.

AI Agent Sync Note: This file represents the current state of the SavePlate repository as of April 18, 2026. When assisting with code, ensure alignment with the green-themed UI and the modular Node.js backend architecture described in the architectural design documents.
