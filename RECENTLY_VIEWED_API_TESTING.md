# Recently Viewed Products API Testing Guide

## Overview
This guide provides comprehensive testing instructions for the Recently Viewed Products API endpoints.

## Base URL
```
http://localhost:YOUR_PORT/api/user/recently-viewed
```

## Authentication
All endpoints require user authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## API Endpoints

### 1. Add Product to Recently Viewed
**Endpoint:** `POST /api/user/recently-viewed/:productId`

**Description:** Adds a product to the user's recently viewed list. If the product already exists, it updates the timestamp and moves it to the top.

**URL Parameters:**
- `productId` (required): MongoDB ObjectId of the product

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product added to recently viewed"
}
```

**Error Responses:**

- **400 Bad Request** - Missing product ID:
```json
{
  "success": false,
  "message": "Product ID is required"
}
```

- **404 Not Found** - Product doesn't exist:
```json
{
  "success": false,
  "message": "Product not found"
}
```

- **401 Unauthorized** - Missing or invalid token:
```json
{
  "success": false,
  "message": "Authorization denied: No token provided"
}
```

**Test Cases:**

1. **Test Adding New Product:**
```bash
curl -X POST http://localhost:3000/api/user/recently-viewed/65a1b2c3d4e5f6789012345a \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Test Updating Existing Product:**
```bash
# Add same product again - should update viewedAt timestamp
curl -X POST http://localhost:3000/api/user/recently-viewed/65a1b2c3d4e5f6789012345a \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Test Invalid Product ID:**
```bash
curl -X POST http://localhost:3000/api/user/recently-viewed/invalid_id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Test Without Authentication:**
```bash
curl -X POST http://localhost:3000/api/user/recently-viewed/65a1b2c3d4e5f6789012345a
```

---

### 2. Get Recently Viewed Products
**Endpoint:** `GET /api/user/recently-viewed`

**Description:** Retrieves the user's recently viewed products with pagination support.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of items per page (max: 100)

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recently viewed products fetched successfully",
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "products": [
    {
      "_id": "65a1b2c3d4e5f6789012345b",
      "product": {
        "_id": "65a1b2c3d4e5f6789012345a",
        "productDetail": {
          "name": "Product Name",
          "category": "65a1b2c3d4e5f6789012345c",
          "hsnCode": "1234",
          "itemCode": "ITEM001",
          "image": "image.jpg",
          "description": "Product description"
        },
        "saleDetails": {
          "salePrice": 999,
          "discount": 10,
          "measuringUnit": "piece"
        },
        "stockDetails": {
          "openingQuantity": 100,
          "location": "Warehouse A"
        }
      },
      "viewedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request** - Invalid pagination parameters:
```json
{
  "success": false,
  "message": "Page number must be greater than 0"
}
```

```json
{
  "success": false,
  "message": "Limit must be between 1 and 100"
}
```

**Test Cases:**

1. **Test Default Pagination:**
```bash
curl -X GET http://localhost:3000/api/user/recently-viewed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Test Custom Pagination:**
```bash
curl -X GET "http://localhost:3000/api/user/recently-viewed?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Test First Page:**
```bash
curl -X GET "http://localhost:3000/api/user/recently-viewed?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Test Invalid Page Number:**
```bash
curl -X GET "http://localhost:3000/api/user/recently-viewed?page=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

5. **Test Limit Exceeds Maximum:**
```bash
curl -X GET "http://localhost:3000/api/user/recently-viewed?limit=200" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Remove Product from Recently Viewed
**Endpoint:** `DELETE /api/user/recently-viewed/:id`

**Description:** Removes a specific product from the user's recently viewed list.

**URL Parameters:**
- `id` (required): MongoDB ObjectId of the recently viewed record

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product removed from recently viewed"
}
```

**Error Responses:**

- **400 Bad Request** - Missing ID:
```json
{
  "success": false,
  "message": "Recently viewed ID is required"
}
```

- **404 Not Found** - Item not found:
```json
{
  "success": false,
  "message": "Recently viewed item not found"
}
```

**Test Cases:**

1. **Test Successful Removal:**
```bash
curl -X DELETE http://localhost:3000/api/user/recently-viewed/65a1b2c3d4e5f6789012345b \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Test Non-existent Item:**
```bash
curl -X DELETE http://localhost:3000/api/user/recently-viewed/65a1b2c3d4e5f6789012345f \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Clear All Recently Viewed Products
**Endpoint:** `DELETE /api/user/recently-viewed`

**Description:** Removes all products from the user's recently viewed list.

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recently viewed list cleared successfully"
}
```

**Test Cases:**

1. **Test Clear All:**
```bash
curl -X DELETE http://localhost:3000/api/user/recently-viewed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Complete Testing Workflow

### Step 1: User Registration/Login
```bash
# Register
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER_ROLE_ID"
  }'

# Login
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Step 2: Add Multiple Products
```bash
# Add Product 1
curl -X POST http://localhost:3000/api/user/recently-viewed/PRODUCT_ID_1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add Product 2
curl -X POST http://localhost:3000/api/user/recently-viewed/PRODUCT_ID_2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add Product 3
curl -X POST http://localhost:3000/api/user/recently-viewed/PRODUCT_ID_3 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 3: Retrieve Recently Viewed
```bash
curl -X GET http://localhost:3000/api/user/recently-viewed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 4: Test Update (Re-add Product 1)
```bash
# Product 1 should move to the top
curl -X POST http://localhost:3000/api/user/recently-viewed/PRODUCT_ID_1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verify order changed
curl -X GET http://localhost:3000/api/user/recently-viewed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 5: Test 20-Item Limit
```bash
# Add 21 products (loop this)
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/user/recently-viewed/PRODUCT_ID_$i \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
done

# Verify only 20 items exist
curl -X GET "http://localhost:3000/api/user/recently-viewed?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 6: Test Pagination
```bash
# Get page 1
curl -X GET "http://localhost:3000/api/user/recently-viewed?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get page 2
curl -X GET "http://localhost:3000/api/user/recently-viewed?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 7: Remove Specific Item
```bash
# Get recently viewed list to find an ID
curl -X GET http://localhost:3000/api/user/recently-viewed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Remove specific item
curl -X DELETE http://localhost:3000/api/user/recently-viewed/RECENTLY_VIEWED_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 8: Clear All
```bash
curl -X DELETE http://localhost:3000/api/user/recently-viewed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing with Postman

### 1. Create Environment
Create a Postman environment with:
- `baseUrl`: `http://localhost:YOUR_PORT`
- `token`: Your JWT token (set after login)

### 2. Collection Setup

**Add Product to Recently Viewed:**
- Method: POST
- URL: `{{baseUrl}}/api/user/recently-viewed/:productId`
- Headers: `Authorization: Bearer {{token}}`
- Path Variables: `productId`

**Get Recently Viewed:**
- Method: GET
- URL: `{{baseUrl}}/api/user/recently-viewed`
- Headers: `Authorization: Bearer {{token}}`
- Query Params: `page`, `limit`

**Remove Product:**
- Method: DELETE
- URL: `{{baseUrl}}/api/user/recently-viewed/:id`
- Headers: `Authorization: Bearer {{token}}`
- Path Variables: `id`

**Clear All:**
- Method: DELETE
- URL: `{{baseUrl}}/api/user/recently-viewed`
- Headers: `Authorization: Bearer {{token}}`

---

## Expected Behaviors

### 1. **Adding Products**
- ✅ New products are added to the list
- ✅ Existing products update their timestamp
- ✅ Re-added products move to the top
- ✅ Maximum 20 products per user
- ✅ Oldest products are removed when limit exceeded

### 2. **Retrieving Products**
- ✅ Products sorted by most recent first
- ✅ Full product details populated
- ✅ Pagination works correctly
- ✅ Empty list returns empty array

### 3. **Removing Products**
- ✅ Specific items can be removed
- ✅ All items can be cleared
- ✅ User can only remove their own items

### 4. **Security**
- ✅ All endpoints require authentication
- ✅ Users can only access their own data
- ✅ Invalid tokens are rejected

---

## Common Issues and Solutions

### Issue 1: "Product not found"
**Solution:** Verify the product ID exists in the database:
```javascript
db.products.findOne({ _id: ObjectId("YOUR_PRODUCT_ID") })
```

### Issue 2: "Authorization denied"
**Solution:** 
1. Check token is valid and not expired
2. Verify Authorization header format: `Bearer TOKEN`
3. Ensure user exists in database

### Issue 3: Products not populating
**Solution:** Verify Product model ref is correct and products exist

### Issue 4: Pagination not working
**Solution:** Check page and limit are positive integers

---

## Database Queries for Verification

### Check Recently Viewed Count
```javascript
db.recentlyvieweds.countDocuments({ user: ObjectId("USER_ID") })
```

### View All Recently Viewed for User
```javascript
db.recentlyvieweds.find({ user: ObjectId("USER_ID") }).sort({ viewedAt: -1 })
```

### Check Oldest Item
```javascript
db.recentlyvieweds.find({ user: ObjectId("USER_ID") }).sort({ viewedAt: 1 }).limit(1)
```

### Verify Uniqueness Constraint
```javascript
db.recentlyvieweds.getIndexes()
// Should see: { user: 1, product: 1 } with unique: true
```

---

## Performance Considerations

1. **Indexes:** Compound indexes on `(user, product)` and `(user, viewedAt)` ensure fast queries
2. **Limit Enforcement:** 20-item limit prevents unbounded growth
3. **Pagination:** Supports efficient loading of large datasets
4. **Lean Queries:** Uses `.lean()` for better performance on read operations

---

## Integration Examples

### Frontend Integration (React/Vue/Angular)
```javascript
// Add to recently viewed when user visits product page
async function trackProductView(productId) {
  try {
    await fetch(`/api/user/recently-viewed/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Failed to track view:', error);
  }
}

// Get recently viewed products
async function getRecentlyViewed(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `/api/user/recently-viewed?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch recently viewed:', error);
  }
}
```

---

## Status Codes Summary

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid parameters or missing data |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Notes

- Recently viewed list is user-specific and private
- Products are automatically removed if they're deleted from the database
- Timestamps are in ISO 8601 format (UTC)
- Maximum limit per request is 100 items
- The 20-item limit is enforced automatically on the backend
