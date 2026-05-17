# SavePlate — Architecture Mentorship Session

**Date:** May 16, 2026  
**Project:** SavePlate  
**Stack:** Angular + TailwindCSS + Node.js + Express + MongoDB Atlas  
**Mentorship Focus:** Software Architecture, Backend Fundamentals, State Management, Product Thinking, and Deployment Strategy

---

# 1. Initial Project Overview

## SavePlate Concept
SavePlate is a smart food waste reduction web application designed for Malaysian households. The app focuses on:

- Food inventory management
- Expiry tracking
- Meal planning
- Community food donation
- Waste reduction analytics
- Notification systems

The app is being developed using:

| Layer | Technology |
|---|---|
| Frontend | Angular 21 |
| Styling | TailwindCSS v4 |
| Backend | Node.js + Express |
| Database | MongoDB |
| Testing | Vitest + Cypress |

---

# 2. Product Thinking Discussion

## Target User Analysis
Initial target users were described broadly as:

> people who want to manage their food inventory and reduce food waste.

Mentorship refinement:

The strongest real-world target users are likely:

- Busy working adults
- University students
- People with time-management issues
- Users who often forget food inside refrigerators

Core user pain points:

- Forgetting expiry dates
- Poor food organization
- Lack of structured meal planning
- Food waste from busy schedules

---

# 3. Core Product Value

The application's real value is NOT only inventory tracking.

The core value is:

> increasing user awareness and behavior regarding food waste.

SavePlate combines:

- inventory management
- notifications
- meal planning
- donations
- analytics

into a single ecosystem.

---

# 4. Daily User Actions

Most common user activities:

- Checking expiring foods
- Adding groceries
- Planning meals
- Reviewing notifications

Important UX realization:

The app should optimize:

- speed
- simplicity
- low-friction interaction
- easy daily checking

Because the target users are busy people.

---

# 5. Frontend State Management Mentorship

## Beginner Problem
Most beginner apps duplicate state across pages.

Example:

- Inventory page stores inventory
- Dashboard stores another inventory copy
- Notifications page stores another copy

This causes:

- stale data
- synchronization bugs
- inconsistent UI

---

## Correct State Management Strategy

Use:

# Service + Angular Signals Architecture

Recommended services:

```text
AuthService
InventoryService
MealPlannerService
NotificationService
AnalyticsService
```

### Important Principle

InventoryService becomes the:

> Single Source of Truth

All other systems react to inventory changes.

---

## Event-Driven Thinking

The app naturally evolved into an event-driven architecture.

Example flow:

```text
User adds milk
    ↓
InventoryService updates inventory signal
    ↓
NotificationService detects expiry
    ↓
MealPlannerService updates meal availability
    ↓
AnalyticsService recalculates statistics
```

Key realization:

> The app is DATA-driven, not PAGE-driven.

---

# 6. Backend Fundamentals Mentorship

## Core Backend Mental Model

Backend development simplified into 5 steps:

1. Receive request
2. Validate request
3. Interact with database
4. Return response
5. Handle errors

Example:

```http
POST /api/auth/register
```

Request:

```json
{
  "email": "user@email.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true
}
```

---

# 7. MongoDB Architecture Mentorship

## Important Clarification

MongoDB Compass is NOT version control.

Compass behaves like:

> a visual database viewer/editor.

It does NOT "push" to MongoDB Atlas like Git.

---

## Correct Cloud Architecture

```text
Angular Frontend
        ↓
Express Backend API
        ↓
MongoDB Atlas
```

Compass optionally connects directly to Atlas.

Recommended strategy:

- Use MongoDB Atlas as main database
- Use Compass only as management GUI
- Avoid running separate local MongoDB servers

---

# 8. Recommended Backend Development Roadmap

## Phase 1 — Backend Foundation

Create:

```text
backend/
  src/
    config/
    controllers/
    middlewares/
    models/
    routes/
```

---

## Phase 2 — Express Test Route

Goal:

```http
GET /api/test
```

Response:

```json
{
  "message": "backend works"
}
```

---

## Phase 3 — MongoDB Connection

Only establish successful Atlas connection.

---

## Phase 4 — User Model

Create only:

- User schema

---

## Phase 5 — Authentication

Build:

```http
POST /register
POST /login
GET /profile
```

---

## Phase 6 — Inventory CRUD

Build:

```http
GET /inventory
POST /inventory
PUT /inventory/:id
DELETE /inventory/:id
```

This is the true application core.

---

# 9. Authentication Strategy Discussion

Initial idea:

- mandatory email verification every login

Mentorship recommendation:

- Verify email only during registration
- Use JWT authentication afterward
- Avoid overcomplicated 2FA before deadline

---

## Session Persistence

Final recommendation:

Use JWT expiration:

```text
JWT expires in 3 hours
```

Instead of manual timers.

---

# 10. Initial Database Schema Design

## User Schema

```ts
User
{
  _id
  name
  email
  passwordHash

  isVerified
  twoFactorEnabled

  createdAt
  updatedAt
}
```

---

## FoodItem Schema

```ts
FoodItem
{
  _id

  userId

  name
  category

  quantity
  unit

  purchaseDate
  expiryDate

  status

  notes

  createdAt
  updatedAt
}
```

---

## MealPlan Schema

```ts
MealPlan
{
  _id

  userId

  title

  plannedDate

  ingredients: [foodItemId]

  completed

  createdAt
}
```

---

## Notification Schema

```ts
Notification
{
  _id

  userId

  type

  title
  message

  relatedFoodItemId

  isRead

  createdAt
}
```

---

# 11. Inventory Logic Decisions

## Duplicate Item Strategy

Users CAN store duplicate food items.

Example:

```text
Milk (expires May 20)
Milk (expires May 27)
```

These are treated as separate inventory entries.

Reason:

- simpler architecture
- simpler notifications
- easier expiry tracking
- easier meal planning logic

---

# 12. Analytics System Design

Planned metrics:

- Saved items
- Avoided expired items
- Meals completed
- Donated items

Refined recommendation:

## Waste Reduction Formula

```text
Waste Reduction Rate = (Used Items / Total Items) × 100%
```

Additional useful analytics:

- most wasted category
- monthly saved items
- donation contribution
- expired item count

---

# 13. Notification Architecture

Recommended hybrid system:

## Immediate Event Notifications

Triggered instantly when:

- adding item
- donation claimed
- meal completed

---

## Scheduled Expiry Scanner

Cron job:

```text
Every day at 8AM:
scan inventory
find expiring foods
generate notifications
```

---

# 14. Donation System Design

## Donation Workflow

Food items remain inside inventory while donating.

Donating behavior:

- donation button toggles state
- user can cancel donation
- donated item disabled from meal planning/editing

---

## Edge Cases Discussed

### If nobody claims donation:

- user receives notification
- app suggests using item before expiry

### If donor cancels:

- item immediately disappears from donation hub

---

# 15. State Machine Realization

The project naturally evolved into a state-machine system.

Example transitions:

```text
available → donating
available → used
available → wasted

donating → available
donating → donated
```

Important engineering principle:

Invalid state transitions should never happen.

Example:

```text
expired → meal plan
```

should be prevented.

---

# 16. Updated Food Status Enum

Recommended statuses:

```ts
available
expiring
expired
used
donating
donated
wasted
claimed
```

---

# 17. Deployment Architecture Mentorship

## Important Realization

GitHub Pages can ONLY host:

- static frontend files

It CANNOT host:

- Express backend
- Node.js server
- MongoDB

---

## Correct Deployment Architecture

```text
Frontend:
GitHub Pages or Vercel

Backend:
Render

Database:
MongoDB Atlas
```

---

# 18. MVP Boundary Definition

## MUST HAVE FEATURES

### Authentication

- register
- login
- logout

### Inventory

- add item
- edit item
- delete item
- mark used
- mark wasted

### Notifications

- expiry alerts
- mark as read

### Meal Planning

- assign ingredients

### Donation Hub

- donate item
- cancel donation
- claim donation

### Analytics

- saved items
- wasted items
- donated items

---

## Features to Avoid Before Deadline

DO NOT IMPLEMENT:

- AI recommendation systems
- OCR/barcode scanning
- realtime websocket systems
- advanced admin panels
- live chat
- push notifications
- family inventory systems
- complex recommendation engines

Reason:

> risk of overengineering before deadline.

---

# 19. Git Collaboration Strategy

Current team workflow:

- separate branches per member
- merge into integration branch first
- keep main branch stable

Mentorship feedback:

This is already a good beginner collaboration structure.

---

# 20. Engineering Assessment

Current skill assessment:

| Area | Level |
|---|---|
| Frontend | Intermediate Beginner |
| Backend | True Beginner |
| Architecture Thinking | Strong Potential |

Strengths observed:

- synchronization thinking
- workflow awareness
- edge case awareness
- feature relationship understanding
- architectural curiosity

---

# 21. Key Mentorship Lessons

## Important Realizations

### The app is:

NOT page-based.

It is:

> data-flow based.

---

### Most web apps are:

```text
Receive data
Validate data
Save data
Return data
```

---

### Biggest project risk:

NOT backend.

NOT MongoDB.

NOT Angular.

The biggest risk is:

> overcomplexity and overengineering.

---

# 22. Pending Architecture Questions (Round 4)

Questions prepared for future mentorship continuation:

1. Should analytics calculations happen on frontend or backend?
2. Should expiry status be dynamically calculated or permanently stored?
3. How should donation security and claim restrictions work?
4. Should Angular services cache/synchronize state?
5. How should offline editing behave during internet reconnection?

---

# Final Mentorship Summary

The SavePlate project evolved from:

> a frontend-based student project

into:

> a realistic event-driven CRUD platform with synchronization architecture.

Major engineering themes explored:

- State management
- Backend mental models
- MongoDB architecture
- Event-driven synchronization
- Authentication strategy
- Deployment architecture
- MVP scoping
- State-machine logic
- Real-world edge cases

The strongest observed potential:

> architectural thinking and system relationship awareness.

The most important future focus:

> building backend confidence through small iterative CRUD implementation.

