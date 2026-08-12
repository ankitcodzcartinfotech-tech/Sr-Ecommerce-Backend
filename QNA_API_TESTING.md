# Product Q&A API Testing Guide

This guide provides instructions and payloads for testing the new Product Questions & Answers feature.

## Base URLs
- Product Q&A: `http://localhost:5000/api/user/products/:id/questions` (assuming port 5000)
- Answers: `http://localhost:5000/api/user/questions/:id/answers`
- Upvotes: `http://localhost:5000/api/user/answers/:id/upvote`

## Authentication
Most endpoints (except potentially reading Q&A depending on frontend implementation, but currently mapped as authenticated in our test setup) require a valid Bearer token from a logged-in user.

---

## 1. Ask a Question
**Endpoint:** `POST /api/user/products/:id/questions`

**Headers:**
- `Authorization: Bearer <your_user_token>`
- `Content-Type: application/json`

**URL Parameter:**
- `id`: The ID of the Product

**Body:**
```json
{
  "question": "Is this saree suitable for summer wear?"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Question posted successfully",
  "data": { ... }
}
```

---

## 2. Get All Questions & Answers for a Product
**Endpoint:** `GET /api/user/products/:id/questions?page=1&limit=10`

**Headers:**
- `Authorization: Bearer <your_user_token>` (Depending on route setup, could be public or protected)

**URL Parameter:**
- `id`: The ID of the Product

**Response (200):**
```json
{
  "success": true,
  "message": "Questions fetched successfully",
  "data": [
    {
      "_id": "question_id",
      "question": "Is this saree suitable for summer wear?",
      "answers": [ ... ],
      "user": { ... }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 3. Answer a Question
**Endpoint:** `POST /api/user/questions/:id/answers`

**Headers:**
- `Authorization: Bearer <your_user_token>`
- `Content-Type: application/json`

**URL Parameter:**
- `id`: The ID of the Question

**Body:**
```json
{
  "answer": "Yes, it is made of pure cotton and is very breathable for summer."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Answer posted successfully",
  "data": { ... }
}
```
*Note: A mock email notification will be logged to the server console indicating the user has been notified of the answer.*

---

## 4. Upvote an Answer
**Endpoint:** `POST /api/user/answers/:id/upvote`

**Headers:**
- `Authorization: Bearer <your_user_token>`

**URL Parameter:**
- `id`: The ID of the Answer (found inside the `answers` array of a question)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Answer upvoted successfully",
  "data": { ... }
}
```
*Note: Hitting this endpoint again will remove the upvote (toggle behavior).*
