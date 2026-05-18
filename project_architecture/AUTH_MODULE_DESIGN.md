# Authentication Module Architecture

## Overview
This document details the architectural design of the Authentication Module for SavePlate, aligning with **Use Case 1 (UC1)** and the guidance from the **Architecture Mentorship Session**. The focus is on security, scalability, and an MVP-friendly implementation that avoids overengineering while maintaining robust functionality.

## Core Features
1. **User Registration:** Collection of user details (name, email, password).
2. **Email Verification:** A 6-digit code sent upon registration. The account remains "unverified" until this code is submitted.
3. **Login:** Verification of credentials and generation of JWT tokens.
4. **JWT Flow & Refresh:** 
   - Uses Access Tokens (short-lived, e.g., 15 minutes) and Refresh Tokens (long-lived, e.g., 7 days).
   - *Mentorship Note:* The final recommendation was a session expiration of 3 hours to keep it simple, but a standard Access/Refresh flow offers better scalability and security.
5. **Password Hashing:** Securing user credentials using `bcrypt`.

---

## Alignment with Mentorship Session & UC1

| Requirement | UC1 Specification | Mentorship Recommendation | Final Implementation Strategy |
|-------------|-------------------|---------------------------|-------------------------------|
| **Verification** | Automated email verification with 6-digit code | Verify email only during registration | Send a 6-digit code during registration. The user must verify this code to activate their account. |
| **Authentication**| Two-Factor Authentication (2FA) | Avoid overcomplicated 2FA before deadline. Use JWT. | **Omitted 2FA for now** to prioritize the deadline (as advised). Implementing robust JWT authentication instead. |
| **Password** | Securely hashed passwords | Standard backend security | Use `bcrypt` for hashing passwords before saving to MongoDB. |

---

## Database Schema (User Model)
```typescript
User {
  _id: ObjectId
  name: String (Required)
  email: String (Required, Unique)
  passwordHash: String (Required)
  
  isVerified: Boolean (Default: false)
  verificationCode: String
  verificationCodeExpires: Date
  
  refreshToken: String

  createdAt: Date
  updatedAt: Date
}
```

---

## API Endpoints (`/api/auth`)

### 1. `POST /register`
- **Payload:** `{ "name", "email", "password" }`
- **Action:** Hashes password, saves user with `isVerified: false`, generates a 6-digit verification code, and sends a verification email.
- **Response:** `{ "message": "Registration successful. Please verify your email." }`

### 2. `POST /verify-email`
- **Payload:** `{ "email", "code" }`
- **Action:** Checks if the code matches and is not expired. If valid, sets `isVerified: true` and clears the code.
- **Response:** `{ "message": "Email verified successfully." }`

### 3. `POST /login`
- **Payload:** `{ "email", "password" }`
- **Action:** Validates credentials. If `isVerified` is false, denies login. If successful, generates an `accessToken` and a `refreshToken`.
- **Response:** `{ "accessToken", "refreshToken", "user" }`

### 4. `POST /refresh-token`
- **Payload:** `{ "refreshToken" }`
- **Action:** Validates the refresh token and issues a new access token.
- **Response:** `{ "accessToken" }`

### 5. `POST /logout`
- **Payload:** `{ "refreshToken" }` (or fetched from Auth Header/User object)
- **Action:** Clears the stored refresh token in the database.
- **Response:** `{ "message": "Logged out successfully" }`

---

## Security Practices
- **Password Hashing:** Passwords are never stored in plain text. `bcrypt` handles salting and hashing.
- **Stateless Sessions (Mostly):** The Access Token is fully stateless. The Refresh Token is stored in the database so it can be revoked remotely if necessary.
- **Verification Expiry:** The 6-digit email verification code expires after 15 minutes to prevent replay attacks.
