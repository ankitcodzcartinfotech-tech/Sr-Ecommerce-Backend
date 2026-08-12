# Keshrag — Auth API Testing Guide
**Base URL:** `http://localhost:7410`  
**Content-Type:** `application/json`

---

## 📋 Table of Contents
1. [Register](#1-register)
2. [Login](#2-login)
3. [Get Profile](#3-get-profile)
4. [Update Profile](#4-update-profile)
5. [Error Reference](#5-error-reference)
6. [cURL Commands](#6-curl-commands)
7. [Postman Collection](#7-postman-collection)

---

## 1. Register

### Endpoint
```
POST /api/user/register
```

### Headers
```
Content-Type: application/json
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Full name |
| `email` | string | ✅ Yes | Valid email address |
| `password` | string | ✅ Yes | Min 1 character |
| `phone` | string | ❌ No | Phone number |

### Example Request
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "Test@1234",
  "phone": "9876543210"
}
```

### ✅ Success Response — 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a341ff7e42229a2b8b150e3",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "profileImage": "uploads/default-user.png",
    "role": {
      "_id": "...",
      "name": "Customer"
    },
    "createdAt": "2026-06-27T10:00:00.000Z",
    "updatedAt": "2026-06-27T10:00:00.000Z"
  }
}
```

### ❌ Error Responses

**400 — Missing required fields**
```json
{
  "success": false,
  "message": "Name, email and password are required"
}
```

**400 — Email already exists**
```json
{
  "success": false,
  "message": "User already registered with this email"
}
```

**500 — Server error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 2. Login

### Endpoint
```
POST /api/user/login
```

### Headers
```
Content-Type: application/json
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | Registered email |
| `password` | string | ✅ Yes | Account password |

### Example Request
```json
{
  "email": "priya@example.com",
  "password": "Test@1234"
}
```

### ✅ Success Response — 200 OK
```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a341ff7e42229a2b8b150e3",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "profileImage": "uploads/default-user.png",
    "phone": "9876543210",
    "role": {
      "_id": "...",
      "name": "Customer"
    },
    "createdAt": "2026-06-27T10:00:00.000Z",
    "updatedAt": "2026-06-27T10:00:00.000Z"
  }
}
```

### ❌ Error Responses

**400 — Missing fields**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**401 — Wrong email or password**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

> **Note:** Both "email not found" and "wrong password" return the same `401` message intentionally — prevents email enumeration attacks.

---

## 3. Get Profile

### Endpoint
```
GET /api/user/profile
```

### Headers
```
Authorization: Bearer <token>
```

### Example Request
```
GET http://localhost:7410/api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ✅ Success Response — 200 OK
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "user": {
    "_id": "6a341ff7e42229a2b8b150e3",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "profileImage": "uploads/default-user.png",
    "phone": "9876543210",
    "role": {
      "_id": "...",
      "name": "Customer"
    },
    "createdAt": "2026-06-27T10:00:00.000Z",
    "updatedAt": "2026-06-27T10:00:00.000Z"
  }
}
```

### ❌ Error Responses

**401 — No token / Invalid token**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**404 — User deleted from DB**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 4. Update Profile

### Endpoint
```
PUT /api/user/profile
```

### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Form Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ❌ No | New display name |
| `email` | string | ❌ No | New email (unique) |
| `password` | string | ❌ No | New password |
| `phone` | string | ❌ No | Phone number |
| `profileImage` | file | ❌ No | JPG/PNG image |

### ✅ Success Response — 200 OK
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "6a341ff7e42229a2b8b150e3",
    "name": "Priya S.",
    "email": "priya@example.com",
    "profileImage": "uploads/users/profile-abc123.jpg",
    "role": { "name": "Customer" }
  }
}
```

### ❌ Error — Email already taken
```json
{
  "success": false,
  "message": "Email already in use"
}
```

---

## 5. Error Reference

| HTTP Code | Meaning | When it happens |
|-----------|---------|-----------------|
| `200` | OK | Login success |
| `201` | Created | Register success |
| `400` | Bad Request | Missing fields, duplicate email |
| `401` | Unauthorized | Wrong credentials, invalid/missing token |
| `404` | Not Found | User deleted from DB |
| `500` | Server Error | Database error, unexpected crash |

---

## 6. cURL Commands

### Register
```bash
curl -X POST http://localhost:7410/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "password": "Test@1234",
    "phone": "9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:7410/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@example.com",
    "password": "Test@1234"
  }'
```

### Get Profile (replace TOKEN)
```bash
curl -X GET http://localhost:7410/api/user/profile \
  -H "Authorization: Bearer TOKEN_HERE"
```

### Update Profile (with image)
```bash
curl -X PUT http://localhost:7410/api/user/profile \
  -H "Authorization: Bearer TOKEN_HERE" \
  -F "name=Priya Sharma Updated" \
  -F "phone=9876543210" \
  -F "profileImage=@/path/to/photo.jpg"
```

---

## 7. Postman Collection

Import the following JSON into Postman:

```json
{
  "info": {
    "name": "Keshrag Auth APIs",
    "_postman_id": "keshrag-auth-v1",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "base_url", "value": "http://localhost:7410" },
    { "key": "token", "value": "" }
  ],
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/user/register",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Priya Sharma\",\n  \"email\": \"priya@example.com\",\n  \"password\": \"Test@1234\",\n  \"phone\": \"9876543210\"\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const res = pm.response.json();",
              "if (res.token) pm.collectionVariables.set('token', res.token);",
              "pm.test('Status 201', () => pm.response.to.have.status(201));",
              "pm.test('Has token', () => pm.expect(res.token).to.be.a('string'));",
              "pm.test('Has user', () => pm.expect(res.user).to.be.an('object'));"
            ]
          }
        }
      ]
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/user/login",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"priya@example.com\",\n  \"password\": \"Test@1234\"\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "const res = pm.response.json();",
              "if (res.token) pm.collectionVariables.set('token', res.token);",
              "pm.test('Status 200', () => pm.response.to.have.status(200));",
              "pm.test('Has token', () => pm.expect(res.token).to.be.a('string'));",
              "pm.test('success true', () => pm.expect(res.success).to.be.true);"
            ]
          }
        }
      ]
    },
    {
      "name": "Login — Wrong Password",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/user/login",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"priya@example.com\",\n  \"password\": \"WrongPassword\"\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status 401', () => pm.response.to.have.status(401));",
              "const res = pm.response.json();",
              "pm.test('success false', () => pm.expect(res.success).to.be.false);"
            ]
          }
        }
      ]
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/user/profile",
        "header": [{ "key": "Authorization", "value": "Bearer {{token}}" }]
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status 200', () => pm.response.to.have.status(200));",
              "const res = pm.response.json();",
              "pm.test('Has user', () => pm.expect(res.user).to.be.an('object'));",
              "pm.test('No password field', () => pm.expect(res.user.password).to.be.undefined);"
            ]
          }
        }
      ]
    },
    {
      "name": "Register — Duplicate Email",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/user/register",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Priya 2\",\n  \"email\": \"priya@example.com\",\n  \"password\": \"Test@1234\"\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status 400', () => pm.response.to.have.status(400));",
              "const res = pm.response.json();",
              "pm.test('Duplicate email error', () => pm.expect(res.message).to.include('already'));"
            ]
          }
        }
      ]
    },
    {
      "name": "Register — Missing Fields",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/user/register",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"noname@example.com\"\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status 400', () => pm.response.to.have.status(400));",
              "pm.test('Error message present', () => pm.expect(pm.response.json().message).to.be.a('string'));"
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Quick Test Checklist

- [ ] Register with valid data → `201` + token received
- [ ] Store token in Postman variable automatically
- [ ] Login with same email/password → `200` + token received
- [ ] Login with wrong password → `401`
- [ ] Login with unregistered email → `401`
- [ ] Register duplicate email → `400`
- [ ] Register missing `name` → `400`
- [ ] Register missing `password` → `400`
- [ ] Get Profile with valid token → `200`, no `password` field in response
- [ ] Get Profile without token → `401`
- [ ] Token expires after **7 days**

---

*Generated from `Keshrag-backend-main/controller/user.controller.js`*
