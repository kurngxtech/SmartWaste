# USE_CASE_CRITERION.md

# SavePlate — Use Case Criterion Documentation

## Project Overview

**Project Name:** SavePlate  
**Project Type:** Smart Food Waste Reduction Platform  
**Platform:** Web-based Application  
**Primary Goal:** Reduce household food waste through inventory management, donation facilitation, meal planning, analytics, and automated notifications.

SavePlate is designed to help household users monitor food inventory, reduce unnecessary waste, facilitate food donations, and improve food consumption planning through a centralized digital platform.

---

# 1. SYSTEM OBJECTIVES

## Main Objectives

- Reduce household food waste.
- Encourage food donation before expiration.
- Help users monitor food inventory efficiently.
- Improve meal planning using available ingredients.
- Provide food-saving analytics and engagement tracking.
- Maintain user privacy and security.

---

# 2. ACTOR DEFINITIONS

| Actor | Description |
|---|---|
| Household User | Registered user who manages food inventory, donations, meal planning, and analytics within the SavePlate platform. |
| System | SavePlate backend services responsible for authentication, validation, analytics, notifications, and data synchronization. |

---

# 3. HIGH LEVEL USE CASE SUMMARY

| Use Case ID | Use Case Name | Primary Goal |
|---|---|---|
| UC1 | User Registration and Security Management | Register and secure user accounts |
| UC2 | Food Inventory Management | Manage household food inventory |
| UC3 | Community Food Browsing | Browse and claim donation listings |
| UC4 | Impact Analytics and Reporting | Track food-saving impact |
| UC5 | Automated Notification System | Notify users about important events |
| UC6 | Weekly Meal Planning | Plan meals based on inventory |

---

# 4. DETAILED USE CASE CRITERIA

---

# UC1 — User Registration and Security Management

## Goal
Allow new users to securely create and activate accounts with privacy protection and Two-Factor Authentication (2FA).

## Primary Actor
Household User

## Preconditions
- User is not yet registered.
- User has access to a valid email address.

## Postconditions
- User account is successfully created.
- Email verification is completed.
- 2FA is activated.
- User can securely access the platform.

## Functional Requirements Mapping

| FR ID | Description |
|---|---|
| FR-1.1 | User registration with personal details |
| FR-1.2 | Automated email verification |
| FR-1.3 | 2FA activation and verification |

## Main Flow

1. User navigates to registration page.
2. System displays registration form.
3. User enters:
   - Full name
   - Email address
   - Password
   - Household size
4. System validates all input fields.
5. System stores user data securely.
6. System sends email verification with 6-digit code.
7. User enters verification code.
8. System activates account.
9. User configures privacy settings.
10. User gains access to dashboard.

## Alternative Flows

### A1 — Existing Email
- If email already exists:
  - System displays error message.
  - Registration is rejected.

### A2 — Invalid Verification Code
- If verification code is expired or invalid:
  - System requests new verification attempt.

## Acceptance Criteria

| Criteria ID | Acceptance Criteria |
|---|---|
| AC-UC1-1 | Registration form validates all required fields |
| AC-UC1-2 | Email verification code is generated and delivered |
| AC-UC1-3 | Invalid verification attempts are rejected |
| AC-UC1-4 | Passwords are securely hashed |
| AC-UC1-5 | User account becomes active after successful verification |

## Security Criteria

- Passwords must be hashed.
- Email verification must expire after a certain duration.
- 2FA process must prevent unauthorized access.
- Sensitive user information must not be exposed publicly.

## Non-Functional Requirements Mapping

| NFR ID | Description |
|---|---|
| NFR-1.1 | Two-Factor Authentication security |
| NFR-1.2 | Password hashing and privacy protection |

---

# UC2 — Food Inventory Management

## Goal
Allow users to manage household food inventory and convert expiring items into donation listings.

## Primary Actor
Household User

## Preconditions
- User is authenticated.
- User is logged into the system.

## Postconditions
- Food inventory is updated.
- Donation listings are created if needed.
- Inventory synchronization remains accurate.

## Functional Requirements Mapping

| FR ID | Description |
|---|---|
| FR-2.1 | Add food inventory items |
| FR-2.2 | Edit, update, delete, and use inventory items |
| FR-2.3 | Convert expiring items into donation listings |

## Main Flow

1. User opens Food Inventory page.
2. System displays inventory dashboard.
3. User selects Add Food Item.
4. User enters:
   - Food item name
   - Quantity
   - Expiry date
   - Category
   - Storage location
   - Notes
5. System validates data.
6. System stores item into database.
7. System updates inventory list.
8. User edits or manages inventory items.
9. User may convert item into donation listing.
10. System requests pickup details.
11. System creates donation listing.

## Alternative Flows

### A1 — Incomplete Form Submission
- If required fields are missing:
  - System rejects submission.
  - System displays validation error.

## Acceptance Criteria

| Criteria ID | Acceptance Criteria |
|---|---|
| AC-UC2-1 | User can create inventory items successfully |
| AC-UC2-2 | Inventory updates appear immediately |
| AC-UC2-3 | User can edit and delete items |
| AC-UC2-4 | Expiring items can be converted into donation listings |
| AC-UC2-5 | Inventory data remains synchronized across modules |

## Data Integrity Criteria

- Inventory quantities must remain accurate.
- Meal planning and donation conversion must update inventory status.
- Duplicate donation conversions must be prevented.

## Non-Functional Requirements Mapping

| NFR ID | Description |
|---|---|
| NFR-3.1 | Real-time inventory synchronization |
| NFR-3.2 | Reliable background notification processing |

---

# UC3 — Community Food Browsing

## Goal
Allow users to browse, filter, and claim available food donation listings.

## Primary Actor
Household User

## Preconditions
- User is authenticated.
- Donation listings are available.

## Postconditions
- Donation status is updated.
- Claim process is recorded.
- Donor receives notification.

## Functional Requirements Mapping

| FR ID | Description |
|---|---|
| FR-3.1 | Browse and filter food listings |
| FR-3.2 | Display detailed listing information |
| FR-3.3 | Claim donation listings |

## Main Flow

1. User navigates to Browse Food Items page.
2. System displays filters:
   - Categories
   - Expiry date
   - Donation status
   - Storage type
3. User applies filter.
4. System displays matching results.
5. User views detailed listing.
6. User clicks Claim Donation.
7. System updates donation status.
8. Donor receives notification.
9. Pickup information is shared.

## Alternative Flows

### A1 — No Matching Results
- If no items match selected filters:
  - System displays No Items Found message.

### A2 — Item Already Claimed
- If another user already claimed item:
  - System blocks duplicate claim.

## Acceptance Criteria

| Criteria ID | Acceptance Criteria |
|---|---|
| AC-UC3-1 | Filtering returns accurate results |
| AC-UC3-2 | Users can view detailed listing information |
| AC-UC3-3 | Users can successfully claim donation listings |
| AC-UC3-4 | Duplicate claiming is prevented |
| AC-UC3-5 | Donor receives claim notification |

## Usability Criteria

- Filtering system must be responsive.
- Listings must be easy to navigate.
- Pickup details must remain clear and readable.

## Non-Functional Requirements Mapping

| NFR ID | Description |
|---|---|
| NFR-2.1 | Responsive web application |
| NFR-2.2 | Intuitive navigation and UI design |

---

# UC4 — Impact Analytics and Reporting

## Goal
Allow users to track food-saving impact through visual analytics and reporting.

## Primary Actor
Household User

## Preconditions
- User has food inventory history.
- User has donation or meal activity.

## Postconditions
- Analytics reports are generated.
- Dashboard displays updated statistics.

## Functional Requirements Mapping

| FR ID | Description |
|---|---|
| FR-4.1 | Generate food-saving reports |
| FR-4.2 | Filter analytics reports |

## Main Flow

1. User navigates to Track My Impact dashboard.
2. System retrieves analytics data.
3. System generates:
   - Food saved totals
   - Donation totals
   - Progress charts
4. User applies filters.
5. System updates analytics view.

## Alternative Flows

### A1 — No Available Data
- If no analytics data exists:
  - System displays motivational onboarding message.

## Acceptance Criteria

| Criteria ID | Acceptance Criteria |
|---|---|
| AC-UC4-1 | Dashboard displays accurate analytics |
| AC-UC4-2 | Charts update correctly based on filters |
| AC-UC4-3 | Historical data is aggregated correctly |
| AC-UC4-4 | Reports load within acceptable response time |

## Analytics Criteria

- Food saved calculations must remain accurate.
- Donation totals must reflect completed claims.
- Filters must dynamically update reports.

---

# UC5 — Automated Notification System

## Goal
Provide automated notifications regarding expiry alerts, donation updates, and meal reminders.

## Primary Actor
Household User

## Preconditions
- User has active inventory or donation activity.
- Notification system is enabled.

## Postconditions
- Notifications are generated.
- Notification status is updated.

## Functional Requirements Mapping

| FR ID | Description |
|---|---|
| FR-5.1 | Expiry notifications |
| FR-5.2 | Donation status notifications |
| FR-5.3 | Notification interaction and read status |

## Main Flow

1. System detects trigger event.
2. System generates notification.
3. Notification appears in dashboard.
4. User opens notification.
5. System redirects user to related page.
6. User marks notification as read.
7. System updates notification status.

## Alternative Flows

### A1 — No Notifications
- If no notifications exist:
  - System displays No New Notifications.

## Acceptance Criteria

| Criteria ID | Acceptance Criteria |
|---|---|
| AC-UC5-1 | Expiry alerts are generated automatically |
| AC-UC5-2 | Notifications appear in correct order |
| AC-UC5-3 | Clicking notifications redirects correctly |
| AC-UC5-4 | Read/unread states are updated accurately |

## Reliability Criteria

- Background jobs must run reliably.
- Notifications should not duplicate.
- Notification delivery should not impact system performance.

## Non-Functional Requirements Mapping

| NFR ID | Description |
|---|---|
| NFR-3.2 | Reliable asynchronous processing |
| NFR-2.2 | User-friendly dashboard navigation |

---

# UC6 — Weekly Meal Planning

## Goal
Help users plan meals using available ingredients while minimizing food waste.

## Primary Actor
Household User

## Preconditions
- User is authenticated.
- User has inventory items available.

## Postconditions
- Weekly meal plan is saved.
- Reserved inventory quantities are updated.
- Meal reminders are scheduled.

## Functional Requirements Mapping

| FR ID | Description |
|---|---|
| FR-6.1 | Calendar-based meal planning |
| FR-6.2 | Recipe suggestions from inventory |
| FR-6.3 | Reserved quantity synchronization |

## Main Flow

1. User opens Plan Weekly Meals page.
2. System displays calendar planner.
3. System displays inventory ingredients.
4. User selects meal slots.
5. User chooses recipes or creates custom meals.
6. System reserves ingredient quantities.
7. User confirms weekly plan.
8. System stores meal plan.
9. System schedules reminders.

## Alternative Flows

### A1 — No Matching Recipes
- If no recipes match ingredients:
  - System suggests generic meals.

## Acceptance Criteria

| Criteria ID | Acceptance Criteria |
|---|---|
| AC-UC6-1 | Weekly calendar is interactive |
| AC-UC6-2 | Inventory ingredients appear correctly |
| AC-UC6-3 | Reserved quantities synchronize correctly |
| AC-UC6-4 | Meal reminders are generated |
| AC-UC6-5 | Recipe suggestions prioritize expiring ingredients |

## Optimization Criteria

- Meal recommendations should prioritize expiring ingredients.
- Inventory synchronization must prevent over-allocation.
- Calendar interface must remain responsive.

---

# 5. GLOBAL SYSTEM CRITERIA

## Security Criteria

- Password hashing must be implemented.
- JWT authentication should be used.
- Two-Factor Authentication must be supported.
- Sensitive data must be protected.
- API endpoints must validate user authorization.

---

## Scalability Criteria

- Modular backend architecture.
- RESTful API structure.
- Database normalization and relationship integrity.
- Service-oriented backend modules.

---

## Performance Criteria

- Dashboard loading should remain responsive.
- Notification jobs should run asynchronously.
- Inventory synchronization must occur in near real-time.

---

## Usability Criteria

- Mobile responsive design.
- Simple navigation flow.
- Clear dashboard organization.
- Minimal learning curve.

---

# 6. DATABASE ENTITY ALIGNMENT

| Entity | Related Use Cases |
|---|---|
| Users | UC1 |
| Inventory | UC2, UC6 |
| DonationListings | UC2, UC3 |
| DonationClaims | UC3 |
| Notifications | UC5 |
| MealPlans | UC6 |
| MealPlanItems | UC6 |
| UserAnalytics | UC4 |

---

# 7. SYSTEM ARCHITECTURE ALIGNMENT

## Frontend Layer

- Angular Single Page Application
- Tailwind CSS UI styling
- Responsive dashboard interfaces

## Backend Layer

- Node.js RESTful API
- Authentication Service
- Inventory Service
- Donation Service
- Analytics Service
- Notification Service
- Meal Planning Service

## Database Layer

- MongoDB / Relational Database Structure
- Real-time inventory synchronization
- Secure user credential storage

---

# 8. CONCLUSION

The SavePlate Use Case Criterion document establishes the functional boundaries, business rules, acceptance criteria, and system constraints for the SavePlate platform. The document ensures that all modules align with the core objective of reducing food waste while maintaining strong security, usability, scalability, and data integrity standards.

This documentation also serves as a foundational reference for:

- software architecture planning,
- backend API development,
- frontend implementation,
- testing validation,
- project management,
- and future scalability improvements.

