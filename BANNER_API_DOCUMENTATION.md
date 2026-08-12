# Banner Management API Documentation

## Overview
This module provides complete banner management functionality for admin users and banner display for regular users.

---

## Admin APIs

### Base URL: `/api/admin/banners`

**Authentication Required:** Yes (Admin Token)

---

### 1. Create Banner

**Endpoint:** `POST /api/admin/banners`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: "Summer Sale 2024" (required)
subtitle: "Up to 50% off on all products" (optional)
image: [file] (required)
buttonText: "Shop Now" (optional)
buttonLink: "/products" (optional)
position: 1 (optional, default: 0)
isActive: true (optional, default: true) - Send as string "true" or "false"
startDate: "2024-06-01T00:00:00.000Z" (optional)
endDate: "2024-08-31T23:59:59.999Z" (optional)
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "title": "Summer Sale 2024",
    "subtitle": "Up to 50% off on all products",
    "image": "uploads/banner-1234567890.jpg",
    "buttonText": "Shop Now",
    "buttonLink": "/products",
    "position": 1,
    "isActive": true,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T23:59:59.999Z",
    "createdAt": "2024-05-20T10:30:00.000Z",
    "updatedAt": "2024-05-20T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Title is required"
}
```
```json
{
  "success": false,
  "message": "Image is required"
}
```

---

### 2. Get All Banners (Admin)

**Endpoint:** `GET /api/admin/banners`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page (max: 100)
- `search` (optional) - Search by title (case-insensitive)

**Example:**
```
GET /api/admin/banners?page=1&limit=10&search=sale
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Banners fetched successfully",
  "data": [
    {
      "_id": "60d5f484f8d2e123456789ab",
      "title": "Summer Sale 2024",
      "subtitle": "Up to 50% off on all products",
      "image": "uploads/banner-1234567890.jpg",
      "buttonText": "Shop Now",
      "buttonLink": "/products",
      "position": 1,
      "isActive": true,
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.999Z",
      "createdAt": "2024-05-20T10:30:00.000Z",
      "updatedAt": "2024-05-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 3. Get Banner by ID

**Endpoint:** `GET /api/admin/banners/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```
GET /api/admin/banners/60d5f484f8d2e123456789ab
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Banner fetched successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "title": "Summer Sale 2024",
    "subtitle": "Up to 50% off on all products",
    "image": "uploads/banner-1234567890.jpg",
    "buttonText": "Shop Now",
    "buttonLink": "/products",
    "position": 1,
    "isActive": true,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T23:59:59.999Z",
    "createdAt": "2024-05-20T10:30:00.000Z",
    "updatedAt": "2024-05-20T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Banner not found"
}
```

---

### 4. Update Banner

**Endpoint:** `PUT /api/admin/banners/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
All fields are optional. Only include fields you want to update.
```
title: "Updated Summer Sale" (optional)
subtitle: "New subtitle" (optional)
image: [file] (optional)
buttonText: "Buy Now" (optional)
buttonLink: "/new-products" (optional)
position: 2 (optional)
isActive: false (optional) - Send as string "true" or "false"
startDate: "2024-06-15T00:00:00.000Z" (optional)
endDate: "2024-09-15T23:59:59.999Z" (optional)
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "title": "Updated Summer Sale",
    "subtitle": "New subtitle",
    "image": "uploads/banner-9876543210.jpg",
    "buttonText": "Buy Now",
    "buttonLink": "/new-products",
    "position": 2,
    "isActive": false,
    "startDate": "2024-06-15T00:00:00.000Z",
    "endDate": "2024-09-15T23:59:59.999Z",
    "createdAt": "2024-05-20T10:30:00.000Z",
    "updatedAt": "2024-05-25T14:45:00.000Z"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Banner not found"
}
```
```json
{
  "success": false,
  "message": "Title cannot be empty"
}
```

---

### 5. Delete Banner

**Endpoint:** `DELETE /api/admin/banners/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```
DELETE /api/admin/banners/60d5f484f8d2e123456789ab
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Banner not found"
}
```

---

### 6. Update Banner Status

**Endpoint:** `PATCH /api/admin/banners/:id/status`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Banner deactivated successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "title": "Summer Sale 2024",
    "isActive": false,
    ...
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Banner not found"
}
```
```json
{
  "success": false,
  "message": "isActive field is required"
}
```

---

## User APIs

### Base URL: `/api/user/banners`

**Authentication Required:** No

---

### 1. Get Active Banners

**Endpoint:** `GET /api/user/banners`

**Description:**
Returns only active banners that are within their date range (if specified). Banners are sorted by position in ascending order.

**Example:**
```
GET /api/user/banners
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Active banners fetched successfully",
  "data": [
    {
      "_id": "60d5f484f8d2e123456789ab",
      "title": "Summer Sale 2024",
      "subtitle": "Up to 50% off on all products",
      "image": "uploads/banner-1234567890.jpg",
      "buttonText": "Shop Now",
      "buttonLink": "/products",
      "position": 1,
      "isActive": true,
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.999Z",
      "createdAt": "2024-05-20T10:30:00.000Z",
      "updatedAt": "2024-05-20T10:30:00.000Z"
    },
    {
      "_id": "60d5f484f8d2e123456789ac",
      "title": "New Arrivals",
      "subtitle": "Check out our latest products",
      "image": "uploads/banner-1234567891.jpg",
      "buttonText": "Explore",
      "buttonLink": "/new-arrivals",
      "position": 2,
      "isActive": true,
      "createdAt": "2024-05-21T09:15:00.000Z",
      "updatedAt": "2024-05-21T09:15:00.000Z"
    }
  ]
}
```

**Banner Filtering Logic:**
- Only returns banners where `isActive: true`
- If `startDate` is set, current date must be >= startDate
- If `endDate` is set, current date must be <= endDate
- Banners without start/end dates are always shown (if active)
- Results sorted by `position` (ascending)

---

## Testing Examples

### Using cURL

#### 1. Create Banner (Admin)
```bash
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Summer Sale 2024" \
  -F "subtitle=Up to 50% off" \
  -F "image=@/path/to/banner.jpg" \
  -F "buttonText=Shop Now" \
  -F "buttonLink=/products" \
  -F "position=1" \
  -F "isActive=true"
```

#### 2. Get All Banners (Admin)
```bash
curl -X GET "http://localhost:7410/api/admin/banners?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 3. Update Banner Status
```bash
curl -X PATCH http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

#### 4. Get Active Banners (User)
```bash
curl -X GET http://localhost:7410/api/user/banners
```

---

## Database Schema

```javascript
{
  title: String (required),
  subtitle: String (optional),
  image: String (required),
  buttonText: String (optional),
  buttonLink: String (optional),
  position: Number (default: 0),
  isActive: Boolean (default: true),
  startDate: Date (optional),
  endDate: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Important Notes

1. **Image Upload**: Images are handled through the `helper/image.js` utility and stored in the `uploads` folder.

2. **Date Filtering**: The user API automatically filters banners based on:
   - Active status (`isActive: true`)
   - Current date within startDate and endDate range

3. **Positioning**: Lower position numbers appear first. Use position to control banner order.

4. **Pagination**: Admin list supports pagination with configurable page and limit parameters.

5. **Search**: Admin can search banners by title (case-insensitive).

6. **Validation**: 
   - Title and image are required for creation
   - Title cannot be empty when updating
   - Page and limit have validation constraints

---

## Error Codes

- `400` - Bad Request (validation errors, missing required fields)
- `404` - Not Found (banner doesn't exist)
- `401` - Unauthorized (missing or invalid admin token)
- `500` - Internal Server Error

---

## Response Format

All responses follow this consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Operation message",
  "data": {} // or []
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```
