# Mobile Auth API Testing Guide

This guide contains the cURL commands and JSON payloads to test the newly implemented Mobile Number + OTP based authentication flow.

---

## 1. Register a New User

**Endpoint:** `POST /api/user/register`  
**Description:** Initiates the registration process. It creates the user (unverified) and sends a mock SMS with the OTP (1234).

**Request Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/api/user/register \
-H "Content-Type: application/json" \
-d '{"mobileNumber": "9876543210"}'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify with the OTP sent to your mobile.",
  "data": {
    "mobileNumber": "9876543210"
  }
}
```

---

## 2. Verify OTP & Login

**Endpoint:** `POST /api/user/verify-otp`  
**Description:** Verifies the OTP. On success, it marks the user as verified and returns the JWT authentication token.

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "1234"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/api/user/verify-otp \
-H "Content-Type: application/json" \
-d '{"mobileNumber": "9876543210", "otp": "1234"}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully authenticated. Welcome to Keshrag!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a2b3c4d5e6f7a8b9c0d1e2",
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "isVerified": true,
    "role": { ... }
  }
}
```

---

## 3. Returning User Login

**Endpoint:** `POST /api/user/login`  
**Description:** Initiates the login process for an existing user. Generates a new OTP (1234) and sends a mock SMS.

**Request Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/api/user/login \
-H "Content-Type: application/json" \
-d '{"mobileNumber": "9876543210"}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your mobile number.",
  "data": {
    "mobileNumber": "9876543210",
    "requiresVerification": true
  }
}
```
> *After this step, call the `verify-otp` API to complete the login process.*

---

## 4. Resend OTP

**Endpoint:** `POST /api/user/resend-otp`  
**Description:** Resends the OTP if the user didn't receive it or if it expired (10 minutes).

**Request Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/api/user/resend-otp \
-H "Content-Type: application/json" \
-d '{"mobileNumber": "9876543210"}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP resent successfully. Please check your mobile.",
  "data": {}
}
```
