# Project Context Repository: SavePlate & BIT216 Assignment 2

## 1. Executive Summary
This document serves as the core knowledge base correlating the software requirements of the **SavePlate** application with the academic evaluation criteria of **BIT216 - Software Engineering Principles (Assignment 2)**. 

* **The "What" (SavePlate Case Study):** Defines the problem domain, target audience, and functional requirements for a smart food waste reduction app.
* **The "How" (BIT216 Assignment 2):** Dictates the software engineering methodology, project management, coding, and testing deliverables required to implement the system across two structured iterations.

---

## 2. System Definition: SavePlate Application
SavePlate is designed to reduce household food waste via intelligent inventory management, expiry alerts, and donation facilitation. 

### Core Use Cases (The Functional Blueprint)
These are the primary modules that need to be translated into code and tested:
1.  **Register User and Privacy Settings:** Account creation, 2FA setup, and privacy configurations.
2.  **Manage Food Inventory:** Logging food items (expiry, quantity, category), editing status, and converting items to donation listings.
3.  **Browse Food Items:** Filtering and viewing inventory or community donation listings; claiming donations.
4.  **Food Analytics:** Generating visual reports and progress indicators on food saved and donations made.
5.  **View Notifications:** System alerts for upcoming expiries, donation claims, and meal planning.
6.  **Plan Weekly Meals:** Creating weekly meal plans linked to existing inventory to optimize ingredient usage.

---

## 3. Execution Framework: BIT216 Assignment 2
The development of SavePlate is divided into two major iterations, requiring individual contributions to coding, testing, and team collaboration via Git.

### Iteration 1 (Due: April 25, 2026)
* **Prototype 1:** Development of initial use cases based on defined User Stories and Acceptance Criteria.
* **Testing:** Compilation of comprehensive Test Cases (Positive/Happy Path and Negative/Error Scenarios).
* **Collaboration:** Active use of Git (setup, push, pull, branch, merge) for collaborative version control.
* **Project Management:** Gantt chart baseline established and tracked.

### Iteration 2 (Due: May 23, 2026)
* **Prototype 2:** Completion of the remaining use cases and system integration.
* **Advanced Testing:** Automated testing applications (e.g., Postman, Vitest, Cypress) and a compiled test analysis report with generic screenshots.
* **Project Review:** Retrospective on project objectives, successes, failures, and Gantt chart baseline vs. actual progress.
* **Presentation:** A 10-minute live demonstration of the final prototype and Git collaboration evidence.

---

## 4. The Correlation: Mapping Requirements to Deliverables
To succeed in this project, the SavePlate requirements must be directly mapped to the Assignment 2 grading rubrics.

### A. Translating Use Cases to User Stories
Every Expanded Use Case from the SavePlate case study must be broken down into standard User Stories:
* *Format:* `As a [Household User], I need [to add an item with an expiry date], so that [I can track my food inventory].`

### B. Mapping Course of Events to Testing Scenarios
The "Typical Course of Events" and "Alternative Course of Events" in the case study dictate the testing requirements for Iteration 1 & 2:
* **Positive Scenarios (Happy Path):** Derived directly from the *Typical Course of Events* (e.g., System saves the record into the database after validating all inputs).
* **Negative Scenarios:** Derived directly from the *Alternative Course of Events* (e.g., Triggering an error message when a user submits an incomplete food inventory form). 

### C. UX/UI & Validations
The Assignment 2 rubric specifically grades UI/UX consistency, originality, and data validation. 
* **Design Constraints:** Utilize a consistent color scheme, limit font variations (less than three), and ensure intuitive navigation.
* **Data Validation:** Realistically place comprehensive validations in data entry forms (e.g., validating the 6-digit 2FA code or ensuring expiry dates are in the future).

### D. Tech Stack & Version Control Alignment
The development of web/mobile interfaces requires strict Git workflow adherence. Branches should logically match the use cases (e.g., `feature/manage-inventory`, `feature/food-analytics`). Collaboration between team members must be visible through regular commits, merges, and issue tracking.
