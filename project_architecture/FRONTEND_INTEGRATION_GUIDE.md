# Frontend Integration Guide

This document tracks the integration of the Node.js/Express backend API into the Angular Frontend.

## Step 1: Frontend Infrastructure Setup (Completed)
We have successfully established the base configuration allowing Angular to securely communicate with the backend API.

### 1. Environment Configuration
* **File:** `src/environments/environment.ts`
* **What it does:** Centralizes the base `apiUrl` (`http://localhost:3000/api`) so it doesn't need to be hardcoded in every service. When you build for production, Angular can swap this with a production URL automatically.

### 2. Angular HTTP Client Provider
* **File:** `src/app/app.config.ts`
* **What it does:** Injects `provideHttpClient(withFetch(), withInterceptors(...))` into the Angular root application, allowing services to make `GET/POST/PUT/DELETE` requests to the Node server.

### 3. Automatic JWT Interceptor
* **File:** `src/app/core/interceptors/jwt.interceptor.ts`
* **What it does (The "Magic" Plumbing):** 
  - Before any API request leaves the frontend, it automatically intercepts it and attaches the `Authorization: Bearer <accessToken>` header from `localStorage`.
  - If a request fails with `401 Unauthorized` (because the 15-minute access token expired), the interceptor automatically calls `/api/auth/refresh-token` in the background, updates `localStorage` with the new token, and retries the failed request seamlessly. The user will never notice!

---

## Step 2: Refactor Use Case 1 - Authentication (Completed)
We have successfully bound the Auth components to the Node.js backend. The application now features real, secure authentication.

### 1. Angular `AuthService`
* **File:** `src/app/authentication/auth.service.ts`
* **What it does:** Replaced the hardcoded, in-memory dummy array with `HttpClient`. The service now correctly calls `/api/auth/register`, `/api/auth/verify-email`, `/api/auth/login`, and `/api/auth/logout`, returning Observables. It also securely saves the `accessToken` and `refreshToken` to `localStorage` upon a successful login.

### 2. Sign-Up Page Integration
* **File:** `src/app/sign-up-page/sign-up-page.ts`
* **What it does:** Subscribes to the live `register` API. On success, it switches to verification mode. It subscribes to `verifyEmail`, and on success, automatically redirects the user to the `/login` page. It also handles live backend error messages (e.g. "Email already registered").

### 3. Login Page Integration
* **File:** `src/app/login-page/login-page.ts`
* **What it does:** Subscribes to the live `login` API. On success, the `accessToken` is stored (thanks to `AuthService`) and it navigates the user securely to the `/dashboard`.

---

## Step 3: Refactor Use Case 2 - Inventory Management (Completed)
The food inventory dashboard is now connected to live MongoDB data.

### 1. Angular `InventoryService`
* **File:** `src/app/services/inventory.service.ts`
* **What it does:** The service successfully replaces local array operations with `HttpClient` calls to `/api/inventory` (GET, POST, PUT, DELETE). It includes a robust mapping layer (`mapToFrontend` / `mapToBackend`) to seamlessly convert Mongoose `_id` and UTC dates into the frontend formats expected by the UI. It also caches the state using Angular Signals (`_items`).

### 2. Food Inventory Page UI Integration
* **File:** `src/app/user-page/food-inventory-page/food-inventory-page.ts`
* **What it does:** The dashboard components subscribe to the Observables returned by `InventoryService`. It securely handles loading states, automatically refreshes the item list upon successful additions or edits, and updates the summary statistics (Total, Expiring Soon, Expired, Donated) in real-time.

---

## Special Step: Refactor Use Case 4 - Impact Analytics (Completed Early)
To ensure the dashboard displays a fresh state for new accounts (like Bagus), we proactively refactored the `AnalyticsService` to hit the real `/api/analytics/summary` endpoint.
* **What it does:** The dashboard now dynamically fetches the exact counts of `totalUsed` and `totalDonated` items from your real MongoDB metrics. We also wiped out the fake `mockData` in the service, causing the monthly impact graph to authentically render at zero for new users.

---

## Next Up: Step 4 - Refactor Use Case 3 & 5 (Donations & Notifications)
We will now move on to binding the community donation board (`DonationHubPage`) to `/api/donations` and the global `NotificationService` to `/api/notifications`!
