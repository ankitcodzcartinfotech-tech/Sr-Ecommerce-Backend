# Cart & Wishlist API Testing Guide

**Base URL**: `http://localhost:7410`

**Authentication**: All cart and wishlist endpoints require user authentication

---

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [Cart APIs](#cart-apis)
3. [Wishlist APIs](#wishlist-apis)
4. [Testing Workflow](#testing-workflow)
5. [Common Errors](#common-errors)

---

## Authentication Setup

### Step 1: Register a User

**Endpoint**: `POST /api/user/register`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "676a1b2c3d4e5f6a7b8c9d0e",
    "name": "Test User",
    "email": "testuser@example.com",
    "role": {
      "_id": "...",
      "name": "Customer"
    }
  }
}
```

---

### Step 2: Login to Get Token

**Endpoint**: `POST /api/user/login`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
```
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "676a1b2c3d4e5f6a7b8c9d0e",
    "name": "Test User",
    "email": "testuser@example.com"
  }
}
```

**Important**: Copy the `token` value. You'll need it for all cart and wishlist requests.

---

## Cart APIs

### 1. Add Item to Cart

**Endpoint**: `POST /api/user/cart/add`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <user-token>
```

**Request Body**:
```json
{
  "product": "676a2b3c4d5e6f7a8b9c0d1e",
  "quantity": 2
}
```

**Field Details**:
- `product`: Valid Product ID (24-character hexadecimal string)
- `quantity`: Integer, minimum 1

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {
    "_id": "676a3b4c5d6e7f8a9b0c1d2e",
    "user": "676a1b2c3d4e5f6a7b8c9d0e",
    "product": {
      "_id": "676a2b3c4d5e6f7a8b9c0d1e",
      "productDetail": {
        "name": "Product Name",
        "image": "image-url.jpg",
        "hsnCode": "62051000"
      },
      "saleDetails": {
        "salePrice": 1000,
        "discount": 10
      }
    },
    "quantity": 2,
    "price": 1000,
    "subtotal": 2000,
    "createdAt": "2026-06-10T10:00:00.000Z",
    "updatedAt": "2026-06-10T10:00:00.000Z"
  }
}
```

**Error Responses**:

❌ **Product not found (404)**:
```json
{
  "success": false,
  "message": "Product not found"
}
```

❌ **Insufficient stock (400)**:
```json
{
  "success": false,
  "message": "Insufficient stock available"
}
```

❌ **Item already in cart (400)**:
```json
{
  "success": false,
  "message": "Item already in cart"
}
```

---

### 2. Get User's Cart

**Endpoint**: `GET /api/user/cart`

**Headers**:
```
Authorization: Bearer <user-token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "cart": [
    {
      "_id": "676a3b4c5d6e7f8a9b0c1d2e",
      "user": "676a1b2c3d4e5f6a7b8c9d0e",
      "product": {
        "_id": "676a2b3c4d5e6f7a8b9c0d1e",
        "productDetail": {
          "name": "Product Name",
          "image": "image-url.jpg",
          "hsnCode": "62051000",
          "itemCode": "ITEM001"
        },
        "saleDetails": {
          "salePrice": 1000,
          "discount": 10
        },
        "stockDetails": {
          "openingQuantity": 50
        }
      },
      "quantity": 2,
      "price": 1000,
      "subtotal": 2000,
      "createdAt": "2026-06-10T10:00:00.000Z",
      "updatedAt": "2026-06-10T10:00:00.000Z"
    }
  ]
}
```

**Empty Cart Response (200)**:
```json
{
  "success": true,
  "cart": []
}
```

---

### 3. Update Cart Item Quantity

**Endpoint**: `PUT /api/user/cart/update/:itemId`

**URL Parameters**:
- `:itemId` - Cart Item ID (not Product ID)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <user-token>
```

**Request Body**:
```json
{
  "quantity": 5
}
```

**Example URL**:
```
PUT http://localhost:7410/api/user/cart/update/676a3b4c5d6e7f8a9b0c1d2e
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "cart": {
    "_id": "676a3b4c5d6e7f8a9b0c1d2e",
    "user": "676a1b2c3d4e5f6a7b8c9d0e",
    "product": {...},
    "quantity": 5,
```
    "price": 1000,
    "subtotal": 5000
  }
}
```

**Error Responses**:

❌ **Cart item not found (404)**:
```json
{
  "success": false,
  "message": "Cart item not found"
}
```

❌ **Insufficient stock (400)**:
```json
{
  "success": false,
  "message": "Insufficient stock available"
}
```

---

### 4. Remove Item from Cart

**Endpoint**: `DELETE /api/user/cart/remove/:itemId`

**URL Parameters**:
- `:itemId` - Cart Item ID

**Headers**:
```
Authorization: Bearer <user-token>
```

**Example URL**:
```
DELETE http://localhost:7410/api/user/cart/remove/676a3b4c5d6e7f8a9b0c1d2e
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

**Error Response**:

❌ **Cart item not found (404)**:
```json
{
  "success": false,
  "message": "Cart item not found"
}
```

---

### 5. Clear Entire Cart

**Endpoint**: `DELETE /api/user/cart/clear`

**Headers**:
```
Authorization: Bearer <user-token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## Wishlist APIs

### 1. Add Item to Wishlist

**Endpoint**: `POST /api/user/wishlist`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <user-token>
```

**Request Body**:
```json
{
  "product": "676a2b3c4d5e6f7a8b9c0d1e"
}
```

**Field Details**:
- `product`: Valid Product ID (24-character hexadecimal string)

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Item added to wishlist",
  "wishlist": {
    "_id": "676a4b5c6d7e8f9a0b1c2d3e",
    "user": "676a1b2c3d4e5f6a7b8c9d0e",
    "product": {
      "_id": "676a2b3c4d5e6f7a8b9c0d1e",
      "productDetail": {
        "name": "Product Name",
        "image": "image-url.jpg",
        "description": "Product description"
      },
      "saleDetails": {
        "salePrice": 1000,
        "discount": 10
      }
    },
    "createdAt": "2026-06-10T10:30:00.000Z",
    "updatedAt": "2026-06-10T10:30:00.000Z"
  }
}
```

**Error Responses**:

❌ **Product not found (404)**:
```json
{
  "success": false,
  "message": "Product not found"
}
```

❌ **Item already in wishlist (400)**:
```json
{
  "success": false,
  "message": "Item already in wishlist"
}
```

---

### 2. Get User's Wishlist

**Endpoint**: `GET /api/user/wishlist`

**Headers**:
```
Authorization: Bearer <user-token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "wishlist": [
    {
      "_id": "676a4b5c6d7e8f9a0b1c2d3e",
      "user": "676a1b2c3d4e5f6a7b8c9d0e",
      "product": {
        "_id": "676a2b3c4d5e6f7a8b9c0d1e",
        "productDetail": {
          "name": "Product Name",
          "image": "image-url.jpg",
          "description": "Premium quality product",
          "hsnCode": "62051000",
          "itemCode": "ITEM001"
        },
        "saleDetails": {
          "salePrice": 1000,
          "discount": 10
        },
        "stockDetails": {
          "openingQuantity": 50
        }
      },
      "createdAt": "2026-06-10T10:30:00.000Z",
      "updatedAt": "2026-06-10T10:30:00.000Z"
    }
  ]
}
```

**Empty Wishlist Response (200)**:
```json
{
  "success": true,
  "wishlist": []
}
```

---

### 3. Remove Item from Wishlist

**Endpoint**: `DELETE /api/user/wishlist/:id`

**URL Parameters**:
- `:id` - Wishlist Item ID

**Headers**:
```
Authorization: Bearer <user-token>
```

**Example URL**:
```
DELETE http://localhost:7410/api/user/wishlist/676a4b5c6d7e8f9a0b1c2d3e
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Item removed from wishlist"
}
```

**Error Response**:

❌ **Wishlist item not found (404)**:
```json
{
  "success": false,
  "message": "Wishlist item not found"
}
```

---

### 4. Move Wishlist Item to Cart

**Endpoint**: `POST /api/user/wishlist/move-to-cart/:id`

**URL Parameters**:
- `:id` - Wishlist Item ID

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <user-token>
```

**Request Body**:
```json
{
  "quantity": 1
}
```

**Example URL**:
```
POST http://localhost:7410/api/user/wishlist/move-to-cart/676a4b5c6d7e8f9a0b1c2d3e
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Item moved to cart",
  "cart": {
    "_id": "676a5b6c7d8e9f0a1b2c3d4e",
    "user": "676a1b2c3d4e5f6a7b8c9d0e",
    "product": {
      "_id": "676a2b3c4d5e6f7a8b9c0d1e",
      "productDetail": {
        "name": "Product Name",
        "image": "image-url.jpg"
      },
      "saleDetails": {
        "salePrice": 1000,
        "discount": 10
      }
    },
    "quantity": 1,
    "price": 1000,
    "subtotal": 1000
  }
}
```

**Notes**:
- This endpoint removes the item from wishlist and adds it to cart
- If quantity is not provided, default is 1
- Stock validation is performed before moving

**Error Responses**:

❌ **Wishlist item not found (404)**:
```json
{
  "success": false,
  "message": "Wishlist item not found"
}
```

❌ **Product not found (404)**:
```json
{
  "success": false,
```
  "message": "Product not found"
}
```

❌ **Insufficient stock (400)**:
```json
{
  "success": false,
  "message": "Insufficient stock available"
}
```

❌ **Item already in cart (400)**:
```json
{
  "success": false,
  "message": "Item already in cart"
}
```

---

## Testing Workflow

### Complete Step-by-Step Testing Guide

#### Setup Phase

1. **Start the server**:
   ```bash
   npm start
   ```
   Server should run on port 7410

2. **Open Postman** or any API testing tool

---

#### Phase 1: User Authentication

**Step 1: Register a new user**
```
POST http://localhost:7410/api/user/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123"
}
```
✅ Expected: 201 Created with user details

**Step 2: Login with the user**
```
POST http://localhost:7410/api/user/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```
✅ Expected: 200 OK with token
📝 **Copy the token for next steps**

---

#### Phase 2: Get Product IDs (Required for Cart/Wishlist)

**Step 3: Login as Admin**
```
POST http://localhost:7410/api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```
✅ Expected: 200 OK with admin token
📝 **Copy the admin token**

**Step 4: Get all products**
```
GET http://localhost:7410/api/admin/products
Authorization: Bearer <admin-token>
```
✅ Expected: 200 OK with products array
📝 **Copy a product _id for testing**

---

#### Phase 3: Cart Testing

**Step 5: Add item to cart**
```
POST http://localhost:7410/api/user/cart/add
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "product": "<product-id-from-step-4>",
  "quantity": 2
}
```
✅ Expected: 201 Created
📝 **Copy the cart item _id**

**Step 6: Get cart**
```
GET http://localhost:7410/api/user/cart
Authorization: Bearer <user-token>
```
✅ Expected: 200 OK with cart items array

**Step 7: Update cart quantity**
```
PUT http://localhost:7410/api/user/cart/update/<cart-item-id>
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "quantity": 5
}
```
✅ Expected: 200 OK with updated cart item

**Step 8: Remove item from cart**
```
DELETE http://localhost:7410/api/user/cart/remove/<cart-item-id>
Authorization: Bearer <user-token>
```
✅ Expected: 200 OK

**Step 9: Clear entire cart** (if items exist)
```
DELETE http://localhost:7410/api/user/cart/clear
Authorization: Bearer <user-token>
```
✅ Expected: 200 OK

---

#### Phase 4: Wishlist Testing

**Step 10: Add item to wishlist**
```
POST http://localhost:7410/api/user/wishlist
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "product": "<product-id>"
}
```
✅ Expected: 201 Created
📝 **Copy the wishlist item _id**

**Step 11: Get wishlist**
```
GET http://localhost:7410/api/user/wishlist
Authorization: Bearer <user-token>
```
✅ Expected: 200 OK with wishlist items array

**Step 12: Move wishlist item to cart**
```
POST http://localhost:7410/api/user/wishlist/move-to-cart/<wishlist-item-id>
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "quantity": 1
}
```
✅ Expected: 200 OK with cart item
✅ Item should be removed from wishlist
✅ Item should appear in cart

**Step 13: Verify item moved**
```
GET http://localhost:7410/api/user/cart
Authorization: Bearer <user-token>
```
✅ Expected: 200 OK, cart should contain the moved item

```
GET http://localhost:7410/api/user/wishlist
Authorization: Bearer <user-token>
```
✅ Expected: 200 OK, wishlist should NOT contain the moved item

**Step 14: Add another item to wishlist**
```
POST http://localhost:7410/api/user/wishlist
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "product": "<different-product-id>"
}
```
✅ Expected: 201 Created

**Step 15: Remove item from wishlist**
```
DELETE http://localhost:7410/api/user/wishlist/<wishlist-item-id>
Authorization: Bearer <user-token>
```
✅ Expected: 200 OK

---

## Common Errors

### Authentication Errors

❌ **Missing Token (401)**:
```json
{
  "success": false,
  "message": "Token not found"
}
```
**Solution**: Add `Authorization: Bearer <token>` header

❌ **Invalid Token (401)**:
```json
{
  "success": false,
  "message": "Invalid token"
}
```
**Solution**: Get a fresh token by logging in again

❌ **Token Expired (401)**:
```json
{
  "success": false,
  "message": "Token expired"
}
```
**Solution**: Tokens expire after 7 days. Login again to get a new token

---

### Validation Errors

❌ **Invalid Product ID Format (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Product ID must be a valid MongoDB ObjectId"]
}
```
**Solution**: Ensure product ID is 24-character hexadecimal string

❌ **Invalid Quantity (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Quantity must be at least 1"]
}
```
**Solution**: Quantity must be a positive integer >= 1

---

### Product Errors

❌ **Product Not Found (404)**:
```json
{
  "success": false,
  "message": "Product not found"
}
```
**Solution**: Use a valid product ID from your database

❌ **Product Out of Stock (400)**:
```json
{
  "success": false,
  "message": "Insufficient stock available"
}
```
**Solution**: Check product stock or reduce quantity

---

### Duplicate Item Errors

❌ **Item Already in Cart (400)**:
```json
{
  "success": false,
  "message": "Item already in cart"
}
```
**Solution**: Update the existing cart item quantity instead

❌ **Item Already in Wishlist (400)**:
```json
{
  "success": false,
  "message": "Item already in wishlist"
}
```
**Solution**: The product is already in your wishlist

---

## Quick Reference Table

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Add to Cart | POST | `/api/user/cart/add` | User |
| Get Cart | GET | `/api/user/cart` | User |
| Update Cart Item | PUT | `/api/user/cart/update/:itemId` | User |
| Remove from Cart | DELETE | `/api/user/cart/remove/:itemId` | User |
| Clear Cart | DELETE | `/api/user/cart/clear` | User |
| Add to Wishlist | POST | `/api/user/wishlist` | User |
| Get Wishlist | GET | `/api/user/wishlist` | User |
| Remove from Wishlist | DELETE | `/api/user/wishlist/:id` | User |
| Move to Cart | POST | `/api/user/wishlist/move-to-cart/:id` | User |

---

## Postman Collection Structure

```
📁 Keshrag API
  📁 User Auth
    ├─ Register User
    ├─ Login User
    └─ Get Profile
  📁 Cart
    ├─ Add to Cart
    ├─ Get Cart
    ├─ Update Cart Item
    ├─ Remove Cart Item
    └─ Clear Cart
  📁 Wishlist
    ├─ Add to Wishlist
    ├─ Get Wishlist
    ├─ Remove from Wishlist
    └─ Move to Cart
```

---

## Tips for Testing

1. **Use Environment Variables in Postman**:
   - Create variables: `baseUrl`, `userToken`, `productId`
   - Use: `{{baseUrl}}/api/user/cart`

2. **Save Tokens**:
   - Use Postman Tests tab to auto-save tokens
   ```javascript
   pm.environment.set("userToken", pm.response.json().token);
   ```

3. **Test Edge Cases**:
   - Try adding same product twice to cart
   - Try adding same product twice to wishlist
   - Try updating quantity beyond stock
   - Try accessing cart without token
   - Try with invalid product IDs

4. **Check Stock Before Testing**:
   - Ensure products have sufficient stock
   - Use products with `openingQuantity > 0`

5. **Monitor Server Logs**:
   - Watch console for errors
   - Check MongoDB connection status

---

## Sample Data for Testing

### Sample Product IDs (Replace with your actual IDs)
```
676a2b3c4d5e6f7a8b9c0d1e
676a2b3c4d5e6f7a8b9c0d1f
676a2b3c4d5e6f7a8b9c0d20
```

### Sample User Credentials
```
Email: test@example.com
Password: test123
```

### Sample Admin Credentials
```
Email: admin@example.com
Password: admin123
```

---

## Expected Database Changes

### After Adding to Cart:
- New document in `carts` collection
- `user` field = logged-in user ID
- `product` field = product ID
- `quantity`, `price`, `subtotal` auto-calculated

### After Adding to Wishlist:
- New document in `wishlists` collection
- `user` field = logged-in user ID
- `product` field = product ID

### After Move to Cart:
- Wishlist document deleted
- New cart document created
- Product stock validated

---

## Features Included

✅ **Cart Features**:
- Add items with quantity
- Get all cart items with populated product details
- Update item quantity with stock validation
- Remove single item
- Clear entire cart
- Auto-calculate subtotal
- Stock validation before add/update

✅ **Wishlist Features**:
- Add items (product ID only)
- Get all wishlist items with populated product details
- Remove items
- Move to cart with quantity
- Prevent duplicate items
- Product validation

✅ **Security Features**:
- User authentication required
- User can only access their own cart/wishlist
- JWT token validation
- Input validation with Joi schemas

✅ **Performance Features**:
- Efficient MongoDB queries
- Populated product details
- Indexed user fields
- Unique compound indexes

---

## Troubleshooting

### Issue: "Token not found"
**Check**:
- Authorization header is present
- Format: `Authorization: Bearer <token>`
- Token is copied correctly (no extra spaces)

### Issue: "Product not found"
**Check**:
- Product ID is valid 24-character hex string
- Product exists in database
- Run `GET /api/admin/products` to verify

### Issue: "Insufficient stock"
**Check**:
- Product `stockDetails.openingQuantity` > 0
- Requested quantity <= available stock
- Product hasn't been oversold

### Issue: "Item already in cart"
**Check**:
- Item isn't already in user's cart
- Use `GET /api/user/cart` to check existing items
- Use update endpoint instead to change quantity

### Issue: Server not responding
**Check**:
- Server is running (`npm start`)
- Port 7410 is not blocked
- MongoDB is running and connected
- Check `.env` file has correct settings

---

## Success! 🎉

You now have a complete guide to test Cart and Wishlist APIs. Follow the workflow step-by-step for best results.

**Next Steps**:
1. Test authentication first
2. Get valid product IDs
3. Test cart operations
4. Test wishlist operations
5. Test move-to-cart feature
6. Test edge cases

Happy Testing! 🚀
