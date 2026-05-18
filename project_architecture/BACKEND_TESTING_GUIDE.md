# SavePlate Backend - Authentication Testing Guide

This guide details how to run and test the newly implemented backend authentication module endpoints.

---

## 1. Prerequisites & Setup

### Start the Backend Server
Run the following command in your terminal at the root of the project to start the backend in development (watch) mode:
```bash
npm run dev:backend
```
You should see:
```text
Server is running on port 3000
MongoDB Connected: cluster0-shard-00-00.1dwnlmm.mongodb.net
```

---

## 2. API Endpoints Testing Checklist

You can test these endpoints using tools like **Postman**, **Insomnia**, **Thunder Client** (VS Code extension), or raw `curl` commands in a separate terminal.

### Step A: Register a New User
* **Endpoint:** `POST http://localhost:3000/api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```

* **Curl Command:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "password": "Password123!"}'
```

* **Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for the verification code."
}
```
> **Action Required:** Check your backend server terminal logs. The email service is simulated, so it logs the 6-digit verification code directly to the console:
> ```text
> =============================================
> 📧 MOCK EMAIL SENT TO: jane@example.com
> 🔐 VERIFICATION CODE: 549302
> =============================================
> ```

---

### Step B: Verify the Email
Copy the 6-digit code printed in the server logs.

* **Endpoint:** `POST http://localhost:3000/api/auth/verify-email`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "email": "jane@example.com",
  "code": "YOUR_6_DIGIT_CODE"
}
```

* **Curl Command:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "code": "YOUR_6_DIGIT_CODE"}'
```

* **Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

---

### Step C: Log In
* **Endpoint:** `POST http://localhost:3000/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

* **Curl Command:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "Password123!"}'
```

* **Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "645...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```
> **Action Required:** Keep track of the `"accessToken"` and `"refreshToken"` returned. You will need them for the next steps.

---

### Step D: Access Protected Profile Route (JWT Verification Test)
This tests the `authMiddleware.js` ensuring that only valid tokens can access the endpoint.

* **Endpoint:** `GET http://localhost:3000/api/auth/profile`
* **Headers:** 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`

* **Curl Command:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

* **Expected Response:**
```json
{
  "success": true,
  "message": "Welcome to your profile",
  "userId": "645..."
}
```
* **Failure Test:** Attempt with an invalid/expired token or without any token. You should receive `401 Unauthorized`.

---

### Step E: Refresh Access Token
When the short-lived access token expires, the client uses the refresh token to get a new one.

* **Endpoint:** `POST http://localhost:3000/api/auth/refresh-token`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

* **Curl Command:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

* **Expected Response:**
```json
{
  "success": true,
  "accessToken": "NEW_ACCESS_TOKEN"
}
```

---

### Step F: Log Out (Invalidate Token)
* **Endpoint:** `POST http://localhost:3000/api/auth/logout`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

* **Curl Command:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

* **Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
> **Action Verification:** If you try to use `POST /refresh-token` again with that same refresh token, it should now return `403 Forbidden` because it was cleared from the database.

---

## 3. UC2: Inventory Management Testing Checklist

To test these endpoints, you **MUST** be logged in. You will need to copy the `accessToken` from your Login request and use it in the headers for all inventory requests!

### Step G: Add a Food Item (POST /api/inventory)
* **Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN` and `Content-Type: application/json`
* **Curl Command:**
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Milk",
    "category": "Dairy",
    "quantity": 2,
    "unit": "bottles",
    "expiryDate": "2026-06-01T00:00:00Z",
    "notes": "Store in the back of the fridge"
  }'
```
* **Expected Response:** You will see the new food item returned with a generated `_id` and `status: "available"`. Keep note of the `_id`!

### Step H: Get All Food Items (GET /api/inventory)
* **Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
* **Curl Command:**
```bash
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
* **Expected Response:** An array containing your newly added "Fresh Milk" item.

### Step I: Update a Food Item (PUT /api/inventory/:id)
* **Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN` and `Content-Type: application/json`
* **Curl Command:**
```bash
curl -X PUT http://localhost:3000/api/inventory/YOUR_ITEM_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "donating",
    "quantity": 1
  }'
```
* **Expected Response:** The food item will be returned with `status` updated to "donating" and `quantity` to 1.

### Step J: Delete a Food Item (DELETE /api/inventory/:id)
* **Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
* **Curl Command:**
```bash
curl -X DELETE http://localhost:3000/api/inventory/YOUR_ITEM_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
* **Expected Response:** `{"success": true, "message": "Food item removed"}`

---

## 4. UC3: Community Donations Testing
*To test this effectively, you need two users. User A updates an item to "donating" (Step I), and User B claims it.*

### Step K: View Available Donations (GET /api/donations)
```bash
curl -X GET http://localhost:3000/api/donations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step L: Claim a Donation (POST /api/donations/:id/claim)
```bash
curl -X POST http://localhost:3000/api/donations/DONATION_ITEM_ID/claim \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 5. UC5: Notifications Testing
*When User B claims User A's donation, User A automatically gets a notification!*

### Step M: View Notifications (GET /api/notifications)
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step N: Mark Notification as Read (PUT /api/notifications/:id/read)
```bash
curl -X PUT http://localhost:3000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 6. UC6: Meal Planning Testing

### Step O: Create a Meal Plan (POST /api/mealplans)
```bash
curl -X POST http://localhost:3000/api/mealplans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pasta Night",
    "plannedDate": "2026-05-20T18:00:00Z",
    "ingredients": ["YOUR_FOOD_ITEM_ID"]
  }'
```

### Step P: Mark Meal as Completed (PUT /api/mealplans/:id)
*This automatically changes the status of the food items to "used"!*
```bash
curl -X PUT http://localhost:3000/api/mealplans/MEAL_PLAN_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

---

## 7. UC4: Impact Analytics Testing

### Step Q: View Your Waste Reduction Analytics (GET /api/analytics/summary)
```bash
curl -X GET http://localhost:3000/api/analytics/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
* **Expected Response:** An aggregation of your `used`, `wasted`, and `donated` items, along with your `wasteReductionRate` percentage!
