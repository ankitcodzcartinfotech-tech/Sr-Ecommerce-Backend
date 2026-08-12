# Keshrag — Complete User API Testing Guide
**Base URL:** `http://localhost:7410/api/user`  
**Auth:** JWT Bearer Token (obtained from Register/Login)  
**Content-Type:** `application/json` (unless noted)

---

## 📋 All Endpoints at a Glance

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| **AUTH** | | | | |
| 1 | POST | `/register` | ❌ | Register new user |
| 2 | POST | `/login` | ❌ | Login |
| 3 | GET | `/profile` | ✅ | Get profile |
| 4 | PUT | `/profile` | ✅ | Update profile |
| **PRODUCTS** | | | | |
| 5 | GET | `/products` | ❌ | List products |
| 6 | GET | `/products/:id` | ❌ | Get single product |
| 7 | GET | `/products/filters` | ❌ | Get filter options |
| 8 | GET | `/products/compare?ids=` | ❌ | Compare products |
| **CATEGORIES** | | | | |
| 9 | GET | `/categories` | ❌ | All categories |
| 10 | GET | `/categories/:id` | ❌ | Single category |
| **BANNERS** | | | | |
| 11 | GET | `/banners` | ❌ | Hero banners |
| **CART** | | | | |
| 12 | GET | `/cart` | ✅ | View cart |
| 13 | POST | `/cart` | ✅ | Add to cart |
| 14 | PUT | `/cart/:itemId` | ✅ | Update quantity |
| 15 | DELETE | `/cart/:itemId` | ✅ | Remove item |
| 16 | DELETE | `/cart` | ✅ | Clear cart |
| **WISHLIST** | | | | |
| 17 | GET | `/wishlist` | ✅ | View wishlist |
| 18 | POST | `/wishlist` | ✅ | Add to wishlist |
| 19 | DELETE | `/wishlist/:itemId` | ✅ | Remove from wishlist |
| 20 | POST | `/wishlist/:itemId/move-to-cart` | ✅ | Move to cart |
| **ADDRESSES** | | | | |
| 21 | GET | `/addresses` | ✅ | All addresses |
| 22 | POST | `/addresses` | ✅ | Add address |
| 23 | PUT | `/addresses/:addressId` | ✅ | Update address |
| 24 | DELETE | `/addresses/:addressId` | ✅ | Delete address |
| 25 | PATCH | `/addresses/:addressId/default` | ✅ | Set default |
| 26 | GET | `/addresses/validate-pincode/:pincode` | ✅ | Validate pincode |
| **ORDERS** | | | | |
| 27 | GET | `/orders` | ✅ | My orders |
| 28 | POST | `/orders` | ✅ | Place order |
| 29 | GET | `/orders/:orderId` | ✅ | Order details |
| 30 | PATCH | `/orders/:orderId/cancel` | ✅ | Cancel order |
| 31 | GET | `/orders/:orderId/track` | ✅ | Track order |
| **REVIEWS** | | | | |
| 32 | GET | `/products/:productId/reviews` | ❌ | Product reviews |
| 33 | POST | `/products/:productId/reviews` | ✅ | Add review |
| 34 | GET | `/reviews/featured` | ❌ | Featured reviews (homepage) |
| **Q&A** | | | | |
| 35 | GET | `/products/:id/questions` | ❌ | Product questions |
| 36 | POST | `/products/:id/questions` | ✅ | Ask question |
| 37 | POST | `/questions/:id/answers` | ✅ | Answer question |
| **SEARCH** | | | | |
| 38 | GET | `/search-history` | ✅ | Recent searches |
| 39 | POST | `/search-history` | ✅ | Save search |
| 40 | DELETE | `/search-history` | ✅ | Clear all history |
| 41 | GET | `/search-history/trending` | ❌ | Trending searches |
| 42 | GET | `/search-history/suggestions?q=` | ❌ | Autocomplete |
| **COUPONS** | | | | |
| 43 | POST | `/coupons/validate` | ❌ | Validate coupon |
| **RECENTLY VIEWED** | | | | |
| 44 | GET | `/recently-viewed` | ✅ | Recently viewed |
| 45 | POST | `/recently-viewed` | ✅ | Add to recently viewed |

---

## 🔐 How to Use Auth Token

After Register or Login, copy the `token` from the response.

**In Postman:** Add to Header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token expires:** 7 days.

---

## 1. AUTH

### POST /register
```json
// Request
{
  "name": "Kavya Patel",
  "email": "kavya@gmail.com",
  "password": "Test@1234",
  "phone": "9876543210"
}

// Response 201
{
  "success": true,
  "token": "eyJ...",
  "user": { "_id": "...", "name": "Kavya Patel", "email": "kavya@gmail.com" }
}
```

### POST /login
```json
// Request
{ "email": "kavya@gmail.com", "password": "Test@1234" }

// Response 200
{ "success": true, "token": "eyJ...", "user": { ... } }
```

### POST /verify-otp
```json
// Request
{ "mobileNumber": "9876543210", "otp": "1234" }

// Response 200
{ "success": true, "token": "eyJ...", "user": { ... } }
```

### POST /resend-otp
```json
// Request
{ "mobileNumber": "9876543210" }

// Response 200
{ "success": true, "message": "OTP resent successfully. Please check your mobile." }
```

### Logout (Client-Side)
> [!NOTE]
> **No Backend API Needed:** Because the API uses stateless JWT authentication, there is no server-side `/logout` endpoint. To log out, the client (frontend or mobile app) simply needs to delete the saved token from Local Storage or Secure Storage.

### GET /profile
```
Headers: Authorization: Bearer <token>

// Response 200
{ "success": true, "user": { "_id": "...", "name": "...", "email": "..." } }
```

### PUT /profile
```
Content-Type: multipart/form-data
Headers: Authorization: Bearer <token>

Form fields:
  name       = "Kavya Shah"
  phone      = "9876543210"
  profileImage = [file upload optional]

// Response 200
{ "success": true, "user": { "name": "Kavya Shah", ... } }
```

---

## 2. PRODUCTS

### GET /products — List with Filters
```
// All products (default 10)
GET /products

// With filters
GET /products?page=1&limit=12&search=silk&category=CATEGORY_ID&fabric=Silk&minPrice=500&maxPrice=5000

Query params:
  page      (default: 1)
  limit     (default: 10, max: 100)
  search    (searches productDetail.name)
  category  (category ObjectId)
  fabric    (variant fabric)
  color     (variant color)
  design    (variant design)
  minPrice  (variant salePrice >=)
  maxPrice  (variant salePrice <=)
  inStock   (true/false)

// Response 200
{
  "products": [...],
  "pagination": { "total": 45, "page": 1, "limit": 12, "totalPages": 4 }
}
```

### GET /products/:id
```
GET /products/6a341ff7e42229a2b8b150e3

// Response 200
{ "product": { "_id": "...", "productDetail": { "name": "..." }, "variants": [...] } }

// Response 404
{ "message": "Product not found" }
```

### GET /products/filters
```
GET /products/filters
GET /products/filters?category=CATEGORY_ID

// Response 200
{   
  "data": {
    "colors": ["Red", "Blue", "Gold"],
    "fabrics": ["Silk", "Cotton", "Organza"],
    "designs": ["Floral", "Plain"],
    "priceRange": { "min": 499, "max": 25000 }
  }
}
```

### GET /products/compare
```/products/compare?ids=ID1,ID2,ID3
GET 

// Response 200
{
  "data": {
    "products": [{ "_id": "...", "name": "...", "salePrice": 1299, ... }],
    "comparedCount": 2
  }
}
```

---

## 3. CATEGORIES

### GET /categories
```
// Response 200
{
  "categories": [
    { "_id": "...", "name": "Silk Sarees", "categoryLogo": "uploads/..." }
  ]
}
```

### GET /categories/:id
```
GET /categories/6a341ff7e42229a2b8b150e3

// Response 200
{ "category": { "_id": "...", "name": "Silk Sarees" } }
```

---

## 4. BANNERS

### GET /banners
```
// Response 200
{
  "banners": [
    { "_id": "...", "title": "New Collection", "image": "uploads/banner1.jpg", "isActive": true }
  ]
}
```

---

## 5. CART  *(Requires Auth)*

### GET /cart
```
// Response 200
{
  "cart": {
    "_id": "...",
    "items": [
      {
        "_id": "CART_ITEM_ID",   ← use this for update/remove
        "product": { "_id": "...", "productDetail": { "name": "..." } },
        "quantity": 2,
        "price": 1299,
        "subtotal": 2598
      }
    ],
    "totalItems": 2,
    "totalPrice": 2598
  }
}
```

### POST /cart — Add item
```json
// Request
{ "productId": "6a341ff7e42229a2b8b150e3", "quantity": 1 }

// Response 200
{ "success": true, "message": "Product added to cart successfully", "cart": {...} }

// Error 400 — insufficient stock
{ "success": false, "message": "Insufficient stock available", "availableStock": 0 }
```

### PUT /cart/:itemId — Update quantity
```
PUT /cart/CART_ITEM_ID

// Request
{ "quantity": 3 }

// Response 200
{ "success": true, "message": "Cart quantity updated successfully", "cart": {...} }
```

> ⚠️ **Important:** Use `item._id` from GET /cart response (cart subdocument ID), NOT the product `_id`.

### DELETE /cart/:itemId — Remove item
```
DELETE /cart/CART_ITEM_ID

// Response 200
{ "success": true, "message": "Item removed from cart successfully", "cart": {...} }

// Error 404
{ "success": false, "message": "Item not found in cart" }
```

### DELETE /cart — Clear cart
```
// Response 200
{ "success": true, "message": "Cart cleared successfully" }
```

---

## 6. WISHLIST  *(Requires Auth)*

### GET /wishlist
```
// Response 200
{
  "wishlist": {
    "items": [
      { "_id": "WISHLIST_ITEM_ID", "product": { "_id": "...", ... } }
    ]
  }
}
```

### POST /wishlist — Add item
```json
{ "productId": "6a341ff7e42229a2b8b150e3" }

// Response 200
{ "success": true, "message": "Product added to wishlist" }
```

### DELETE /wishlist/:itemId — Remove
```
DELETE /wishlist/WISHLIST_ITEM_ID

// Response 200
{ "success": true, "message": "Item removed from wishlist" }
```

### POST /wishlist/:itemId/move-to-cart
```
POST /wishlist/WISHLIST_ITEM_ID/move-to-cart

// Request body (optional)
{ "quantity": 1 }

// Response 200
{ "success": true, "message": "Item moved to cart" }
```

---

## 7. ADDRESSES  *(Requires Auth)*

### GET /addresses
```
// Response 200
{
  "addresses": [
    {
      "_id": "ADDRESS_ID",
      "fullName": "Kavya Patel",
      "phone": "9876543210",
      "addressLine1": "123 MG Road",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "pincode": "380001",
      "country": "India",
      "addressType": "Home",
      "isDefault": true
    }
  ]
}
```

### POST /addresses — Add address
```json
{
  "fullName": "Kavya Patel",
  "phone": "9876543210",
  "addressLine1": "123 MG Road",
  "addressLine2": "Near Lal Darwaja",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380001",
  "country": "India",
  "addressType": "Home",
  "isDefault": true
}

// Response 201
{ "success": true, "message": "Address added successfully", "address": {...} }

// Required: fullName, phone, addressLine1, city, state, pincode
```

### PUT /addresses/:addressId — Update
```json
// Only send fields you want to change
{ "city": "Surat", "pincode": "395001", "state": "Gujarat" }

// Response 200
{ "success": true, "address": {...} }
```

### PATCH /addresses/:addressId/default — Set default
```
// Response 200
{ "success": true, "message": "Default address set successfully" }
```

### DELETE /addresses/:addressId
```
// Response 200
{ "success": true, "message": "Address deleted successfully" }
```

### GET /addresses/validate-pincode/:pincode
```
GET /addresses/validate-pincode/380001

// Response 200
{
  "success": true,
  "data": { "city": "Ahmedabad", "state": "Gujarat", "country": "India" }
}

// Response 404
{ "success": false, "message": "Invalid pincode" }
```

---

## 8. ORDERS  *(Requires Auth)*

### POST /orders — Place order
```json
// Must add to cart + save address first

{
  "addressId": "ADDRESS_ID",
  "paymentMethod": "COD",
  "notes": "Please deliver in morning",
  "shippingCost": 0 
}

// paymentMethod values: COD | UPI | Card | Razorpay | Online (case-insensitive)

// Response 201
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "ORDER_ID",
    "orderNumber": "ORD-1719456789000-042",
    "orderStatus": "Pending",
    "paymentStatus": "Pending",
    "totalAmount": 2598,
    "totalItems": 2
  }
}

// Error 400 — cart empty
{ "success": false, "message": "Cart is empty" }

// Error 400 — insufficient stock
{ "success": false, "message": "Insufficient stock for \"Banarasi Silk\". Available: 1" }
```

### GET /orders — My orders
```
GET /orders
GET /orders?page=1&limit=10&status=Delivered

// status filter: Pending | Confirmed | Processing | Shipped | Delivered | Cancelled

// Response 200
{
  "orders": [...],
  "pagination": { "total": 5, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### GET /orders/:orderId — Order detail
```
GET /orders/ORDER_ID

// Response 200
{
  "order": {
    "_id": "...",
    "orderNumber": "ORD-...",
    "orderStatus": "Pending",
    "paymentMethod": "COD",
    "items": [...],
    "shippingAddress": { "fullName": "...", "city": "...", ... },
    "subtotal": 2598,
    "shippingCost": 0,
    "totalAmount": 2598
  }
}
```

### PATCH /orders/:orderId/cancel — Cancel order
```json
// Request (optional)
{ "cancelReason": "Changed my mind" }

// Response 200 (only for Pending or Confirmed orders)
{ "success": true, "message": "Order cancelled successfully" }

// Error 400
{ "success": false, "message": "Order cannot be cancelled. Current status: Shipped" }
```

### GET /orders/:orderId/track
```
GET /orders/ORDER_ID/track

// Response 200
{
  "tracking": {
    "orderNumber": "ORD-...",
    "currentStatus": "Shipped",
    "timeline": [
      { "status": "Pending",   "label": "Order Placed",    "completed": true,  "isCurrent": false },
      { "status": "Confirmed", "label": "Order Confirmed", "completed": true,  "isCurrent": false },
      { "status": "Processing","label": "Processing",      "completed": true,  "isCurrent": false },
      { "status": "Shipped",   "label": "Shipped",         "completed": true,  "isCurrent": true  },
      { "status": "Delivered", "label": "Delivered",       "completed": false, "isCurrent": false }
    ]
  }
}
```

---

## 9. REVIEWS

### GET /products/:productId/reviews
```
GET /products/PRODUCT_ID/reviews

// Response 200
{
  "reviews": [...],
  "stats": { "avgRating": 4.8, "totalReviews": 12, "fiveStar": 9, ... }
}
```

### POST /products/:productId/reviews *(Auth)*
```
Content-Type: multipart/form-data

Form fields:
  orderId   = ORDER_ID    (required — must have ordered this product)
  rating    = 5           (required, 1–5)
  title     = "Lovely!"   (optional)
  comment   = "Amazing quality saree." (optional)
  images    = [file, file] (optional, max 5)

// Response 201
{ "success": true, "message": "Review added successfully" }

// Error 400 — not purchased
{ "success": false, "message": "You can only review products you have purchased" }
```

### GET /reviews/featured
```
GET /reviews/featured
GET /reviews/featured?limit=5

// Response 200
{
  "reviews": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Beautiful saree",
      "user": { "name": "Priya", "profileImage": "..." },
      "product": { "productDetail": { "name": "Silk Saree" } }
    }
  ]
}
```

---

## 10. Q&A

### GET /products/:id/questions
```
GET /products/PRODUCT_ID/questions?page=1&limit=10

// Response 200
{
  "data": [
    {
      "_id": "QUESTION_ID",
      "question": "Is this available in blue?",
      "user": { "name": "Meera" },
      "answers": [
        { "_id": "...", "answer": "Yes, available in 5 colours.", "user": { "name": "..." } }
      ]
    }
  ],
  "pagination": { "total": 3, ... }
}
```

### POST /products/:id/questions *(Auth)*
```json
{ "question": "Does it come with a blouse piece?" }

// Response 201
{ "success": true, "message": "Question posted successfully", "data": {...} }
```

### POST /questions/:id/answers *(Auth)*
```json
{ "answer": "Yes, 0.8m unstitched blouse piece included." }

// Response 201
{ "success": true, "message": "Answer posted successfully" }
```

---

## 11. SEARCH

### GET /search-history/trending
```
GET /search-history/trending?limit=5

// Response 200
{
  "data": [
    { "query": "silk saree", "totalSearches": 47 },
    { "query": "banarasi", "totalSearches": 31 }
  ]
}
```

### GET /search-history/suggestions
```
GET /search-history/suggestions?q=silk

// Response 200
{ "data": ["silk saree", "silk cotton", "silk organza"] }
```

### GET /search-history *(Auth)*
```
// Response 200
{ "data": [{ "_id": "...", "query": "wedding saree", "updatedAt": "..." }] }
```

### POST /search-history *(Auth)*
```json
{ "query": "banarasi silk" }

// Response 200
{ "success": true, "message": "Search history saved successfully" }
```

### DELETE /search-history *(Auth)* — Clear all
```
// Response 200
{ "success": true, "message": "Search history cleared successfully" }
```

### DELETE /search-history/:id *(Auth)* — Delete one
```
// Response 200
{ "success": true, "message": "Search history item deleted successfully" }
```

---

## 12. COUPONS

### POST /coupons/validate
```json
{
  "code": "KESHRAG10",
  "orderAmount": 2500
}

// Response 200
{
  "success": true,
  "coupon": {
    "code": "KESHRAG10",
    "type": "percentage",
    "value": 10,
    "discountAmount": 250,
    "description": "10% off on all orders"
  }
}

// Error 404
{ "success": false, "message": "Invalid coupon code" }

// Error 400 — expired
{ "success": false, "message": "This coupon has expired" }

// Error 400 — min order not met
{ "success": false, "message": "Minimum order amount of Rs. 1000 required for this coupon" }
```

---

## 13. RECENTLY VIEWED  *(Requires Auth)*

### GET /recently-viewed
```
GET /recently-viewed?page=1&limit=10

// Response 200
{
  "products": [
    { "_id": "...", "product": { "_id": "...", "productDetail": {...} }, "viewedAt": "..." }
  ],
  "total": 8,
  "page": 1
}
```

### POST /recently-viewed — Track a view
```json
{ "productId": "PRODUCT_ID" }

// Response 200
{ "success": true, "message": "Product added to recently viewed" }
```

---

## 🧪 Complete Test Flow (Step by Step)

Follow this order to test the full user journey end-to-end:

```
Step 1  →  POST /register            (get token)
Step 2  →  GET  /profile             (verify login works)
Step 3  →  GET  /banners             (homepage banners)
Step 4  →  GET  /categories          (browse categories)
Step 5  →  GET  /products            (browse products)
Step 6  →  GET  /products/filters    (filter options)
Step 7  →  GET  /products/:id        (product detail — copy product _id)
Step 8  →  POST /recently-viewed     (track view)
Step 9  →  POST /cart                (add to cart with product _id)
Step 10 →  GET  /cart                (verify item added — copy item._id)
Step 11 →  PUT  /cart/:itemId        (update qty using item._id)
Step 12 →  POST /wishlist            (add to wishlist)
Step 13 →  GET  /wishlist            (verify)
Step 14 →  POST /addresses           (add shipping address — copy address _id)
Step 15 →  GET  /addresses/validate-pincode/380001
Step 16 →  POST /coupons/validate    (test coupon code)
Step 17 →  POST /orders              (place order using address _id — copy order _id)
Step 18 →  GET  /orders              (verify order appears)
Step 19 →  GET  /orders/:orderId     (order detail)
Step 20 →  GET  /orders/:orderId/track
Step 21 →  PATCH /orders/:orderId/cancel (test cancel)
Step 22 →  POST /products/:id/questions (ask a question)
Step 23 →  GET  /search-history/trending
Step 24 →  POST /search-history      (save search)
Step 25 →  GET  /reviews/featured    (homepage reviews)
```

---

## ❌ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Access denied` | Missing or invalid token | Add `Authorization: Bearer TOKEN` header |
| `Item not found in cart` | Using product `_id` instead of cart item `_id` | Use `item._id` from `GET /cart` response |
| `Cart is empty` | Trying to order without adding to cart | `POST /cart` first |
| `Address not found` | Wrong address ID or belongs to another user | Use `GET /addresses` to get your address IDs |
| `Insufficient stock` | Product out of stock | Check `stockDetails.openingQuantity` in product |
| `Invalid coupon code` | Wrong code or expired | Try `KESHRAG10` for testing |
| `Cannot cancel order` | Order already Shipped/Delivered | Only Pending/Confirmed can be cancelled |

---

## 🔧 Postman Environment Setup

Create a Postman Environment with these variables:

| Variable | Initial Value |
|----------|---------------|
| `base_url` | `http://localhost:7410/api/user` |
| `token` | *(auto-filled after login)* |
| `product_id` | *(paste a product _id)* |
| `cart_item_id` | *(paste from GET /cart response)* |
| `address_id` | *(paste from POST /addresses response)* |
| `order_id` | *(paste from POST /orders response)* |

**Auto-save token in Login/Register tests tab:**
```javascript
const res = pm.response.json();
if (res.token) pm.environment.set("token", res.token);
```

---

*Generated from actual source code — `Keshrag-backend-main`*  
*Last updated: June 2026*
