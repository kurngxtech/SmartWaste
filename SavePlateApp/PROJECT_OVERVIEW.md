# SavePlate Project Overview & Analysis

## 1. Goals and Objectives
**SavePlate** is a "Smart Food Waste Reduction App" designed specifically for Malaysian households. Its mission is to reduce household food waste through intelligent inventory management, expiry alerts, donation facilitation, and responsible meal planning.

- **Primary Objective**: Develop a functional, responsive web application that tracks inventory, provides expiry alerts, and helps users plan their meals to reduce food waste.
- **Key Goals**: 
  - Develop a web-based prototype that protects user data and account privacy.
  - Foster sustainable consumption habits.
  - Complete the project across two structured iterations (Prototype 1 by April 25, 2026, and Final Prototype by May 23, 2026).

---

## 2. Directory Structure Tree

```text
SavePlateApp/
├── backend/                    # Node.js (Express) Logic Layer
│   ├── src/
│   │   ├── config/             # DB connection (MongoDB) & env variables
│   │   ├── controllers/        # UC1-UC6 request handlers
│   │   ├── middlewares/        # Auth, error, and validation logic
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API endpoint definitions
│   │   ├── services/           # Business logic & database interaction
│   │   └── utils/              # Helper functions
│   ├── tests/
│   │   ├── integration/        # API endpoint testing
│   │   └── unit/               # Isolated logic testing
│   └── server.js               # Backend entry point
├── src/                        # Angular Frontend (Standalone Components)
│   ├── app/
│   │   ├── authentication/     # Auth logic & AuthService
│   │   ├── models/             # Data interfaces (AppNotification, etc.)
│   │   ├── services/           # Shared business logic (NotificationService, InventoryService)
│   │   ├── user-page/          # Core feature pages
│   │   │   ├── dashboard-page/
│   │   │   ├── side-bar-navigation/
│   │   │   └── ...
│   │   ├── app.routes.ts       # Frontend routing
│   │   └── app.config.ts
│   ├── assets/
│   └── index.html
├── cypress/                    # E2E Testing with Cypress
├── public/                     # Static assets
├── angular.json                # Angular CLI configuration
├── package.json                # Project dependencies & scripts
├── tailwind.config.js          # Tailwind CSS v4 configuration
└── [MD Files]                  # Context & progress documentation
```

---

## 3. Project Progress & Current Status

### **Iteration 1: Prototype Phase (Completed)**
- **UI/UX Foundation**: Established modern, eco-friendly sustainability theme with deep green gradients.
- **Auth Components**: Built `LoginPageComponent` and `SignUpPageComponent` with full validation logic.
- **Dashboard Shell**: Implemented fixed sidebar, top navbar, and responsive main content area.
- **Mock Integration**: Used mock data (hardcoded JSON) for Analytics (UC4) and Inventory (UC2) to maintain velocity.
- **Tailwind Migration**: Successfully migrated from manual CSS to Tailwind CSS utility classes.
- **Testing Milestone**: Achieved 100% success rate (56 Vitest passed, 8 Cypress passed).

### **Iteration 2: Implementation & Integration (In Progress)**
- **Current Task**: Establishing the Backend Service directory structure.
- **Backend Setup**: Configured a Node.js/Express environment using MongoDB (NoSQL) for the logic layer.
- **Database Strategy**: Switched from PostgreSQL to MongoDB Compass to support flexible data modeling for food items and users.
- **Upcoming**: Transitioning from mock authentication to real API endpoints (`POST /api/auth/register`).

---

## 4. Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Angular 21 (Standalone Components, SSR) |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL) |
| **Visuals** | Chart.js (Analytics) |
| **Testing** | Vitest (Unit), Cypress (E2E), Selenium IDE (Scripts) |

---

## 5. Team Responsibilities (Use Case Distribution)

- **Bagus (Self)**: 
  - **UC1**: User Registration and Security Management (2FA, Account Privacy).
  - **UC4**: Impact Analytics and Reporting (Visual reports on food saved).
- **Kevin**:
  - **UC2**: Food Inventory Management (Expiry, Quantity, Status).
  - **UC6**: Weekly Meal Planning (Linked to inventory).
- **Ari**:
  - **UC3**: Community Food Browsing (Donations filtering/claiming).
  - **UC5**: Automated Notification System (Expiry alerts).

---

## 6. Testing & Quality Assurance Summary

### **Strategy**
- **Unit Testing (Vitest)**: Focused on `AuthService`, `NotificationService`, and component-level logic (Positive/Negative scenarios).
- **Integration Testing**: Verifying boundaries between UI components and real services (e.g., `SignUpPageComponent` interacting with `AuthService`).
- **End-to-End (Cypress)**: Simulating real user journeys (Login -> Dashboard -> Navigation).
- **Selenium IDE**: Used for repetitive browser actions and isolated routine verification.

### **Test Health**
- **Unit/Integration**: 56/56 Passed (✅)
- **E2E**: 8/8 Passed (✅)

---

## 7. Key Feature Synchronizations
- **Notification Center**: Centralized via `NotificationService` using Angular Signals to ensure consistency between the Dashboard sidebar, Header indicator, and the full Notifications page.
- **Meal Planner**: Implemented exact date filtering (`YYYY-MM-DD`) to avoid timezone shifts and prevent meal data from leaking across weeks.
- **Inventory Sync**: Integrated "Mark as Used" and "Plan for Meal" workflows to dynamically update inventory and affect analytics metrics.

---
*Last Updated: May 15, 2026*
