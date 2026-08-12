# Order API - Fix Guide

## Problem Identified
You were using the WRONG API endpoint URL in Postman.

### ❌ WRONG URL (shown in your screenshot):
```
POST http://localhost:7410/api/admin/order/add/user/wishlist/item/to-cart
```

### ✅ CORRECT URL:
```
POST http://localhost:7410/api/admin/orders
```

---

## Complete Order Creation Request

### Endpoint
```
POST http://localhost:7410/api/admin/orders
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-admin-token>
```

### Request Body (JSON)
```json
{
  "orderType": "Sales",
  "spoDate": "2026-06-10T00:00:00.000Z",
  "party": "6a292b9a9a2bbf0b5b0d64ec",
  "validDate": "2026-06-20T00:00:00.000Z",
  "items": [
    {
      "product": "6a2930fa55a76b6e1ceeeb1d",
      "description": "Product Description",
      "designNo": "DES-001",
      "hsnCode": "62051000",
      "pcs": 10,
      "rate": 100,
      "total": 1000,
      "discPercent": 0,
      "discAmount": 0,
      "taxableAmount": 1000,
      "cgstPercent": 9,
      "cgstAmount": 90,
      "sgstPercent": 9,
      "sgstAmount": 90,
      "igstPercent": 0,
      "igstAmount": 0,
      "netAmount": 1180
    }
  ],
  "taxableAmountTotal": 1000,
  "cgstTotal": 90,
  "sgstTotal": 90,
  "igstTotal": 0,
  "extraDiscountPercent": 0,
  "extraDiscountAmount": 0,
  "shippingCost": 0,
  "invoiceTotal": 1180,
  "notes": "Test order"
}
```

---

## All Order API Endpoints

### 1. Get All Orders
```
GET http://localhost:7410/api/admin/orders
```

### 2. Get Next SPO Number
```
GET http://localhost:7410/api/admin/orders/next-spo-no
```

### 3. Get Single Order
```
GET http://localhost:7410/api/admin/orders/:id
```
Example: `GET http://localhost:7410/api/admin/orders/6a292b9a9a2bbf0b5b0d64ec`

### 4. Create Order
```
POST http://localhost:7410/api/admin/orders
```

### 5. Update Order
```
PUT http://localhost:7410/api/admin/orders/:id
```

### 6. Delete Order
```
DELETE http://localhost:7410/api/admin/orders/:id
```

---

## Required Fields for Order Creation

| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| orderType | String | Yes | "Sales", "Purchase", "Job Work" |
| party | ObjectId | Yes | Valid Party ID |
| validDate | Date | Yes | ISO 8601 format |
| items | Array | Yes | At least 1 item |
| taxableAmountTotal | Number | Yes | >= 0 |
| cgstTotal | Number | Yes | >= 0 |
| sgstTotal | Number | Yes | >= 0 |
| igstTotal | Number | Yes | >= 0 |
| invoiceTotal | Number | Yes | >= 0 |

---

## Optional Fields

- spoNo (Number)
- spoDate (Date)
- transport (ObjectId)
- agent (ObjectId)
- extraDiscountPercent (Number, 0-100)
- extraDiscountAmount (Number, >= 0)
- shippingCost (Number, >= 0)
- notes (String)
- terms (Array of Strings)

---

## Item Object Structure (Required in items array)

Each item must have:
```json
{
  "product": "ObjectId",          // Required
  "description": "String",         // Required
  "pcs": 1,                        // Required, min: 1
  "rate": 0,                       // Required, min: 0
  "total": 0,                      // Required
  "taxableAmount": 0,              // Required
  "netAmount": 0,                  // Required
  "designNo": "String",            // Optional
  "hsnCode": "String",             // Optional
  "discPercent": 0,                // Optional, 0-100, default: 0
  "discAmount": 0,                 // Optional, >= 0, default: 0
  "cgstPercent": 0,                // Optional, 0-100, default: 0
  "cgstAmount": 0,                 // Optional, >= 0, default: 0
  "sgstPercent": 0,                // Optional, 0-100, default: 0
  "sgstAmount": 0,                 // Optional, >= 0, default: 0
  "igstPercent": 0,                // Optional, 0-100, default: 0
  "igstAmount": 0                  // Optional, >= 0, default: 0
}
```

---

## Steps to Fix Your Request in Postman

1. **Change the URL** from:
   ```
   http://localhost:7410/api/admin/order/add/user/wishlist/item/to-cart
   ```
   
   To:
   ```
   http://localhost:7410/api/admin/orders
   ```

2. **Set Method** to `POST`

3. **Add Headers**:
   - Content-Type: `application/json`
   - Authorization: `Bearer <your-admin-token>`

4. **Select Body** → `raw` → `JSON`

5. **Paste the JSON** shown above (update IDs with your actual party and product IDs)

6. **Click Send**

---

## Expected Success Response

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "...",
    "orderType": "Sales",
    "spoDate": "2026-06-10T00:00:00.000Z",
    "party": {...},
    "validDate": "2026-06-20T00:00:00.000Z",
    "items": [...],
    "taxableAmountTotal": 1000,
    "cgstTotal": 90,
    "sgstTotal": 90,
    "igstTotal": 0,
    "invoiceTotal": 1180,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Common Errors

### 1. "Party is required"
- Make sure the party ID exists in your database
- Check it's a valid 24-character hexadecimal string

### 2. "At least one item is required in the order"
- Ensure items array has at least 1 item
- Check all required item fields are present

### 3. "Invalid token" or "Token not found"
- Make sure you're using a valid admin token
- Token format: `Bearer <token>`
- Get token from admin login response

### 4. "404 Not Found"
- Double-check the URL is exactly: `http://localhost:7410/api/admin/orders`
- Make sure server is running on port 7410

---

## Testing Workflow

1. **Get Admin Token** (if you don't have one):
   ```
   POST http://localhost:7410/api/admin/login
   Body: {
     "email": "admin@example.com",
     "password": "your-password"
   }
   ```

2. **Get a Party ID**:
   ```
   GET http://localhost:7410/api/admin/parties
   ```

3. **Get a Product ID**:
   ```
   GET http://localhost:7410/api/admin/products
   ```

4. **Create Order** using the IDs from steps 2 and 3

---

## Summary

The validation is working correctly. The problem was that you were using the wrong API endpoint URL. 

Use: `POST http://localhost:7410/api/admin/orders`

Not: `POST http://localhost:7410/api/admin/order/add/user/wishlist/item/to-cart`
