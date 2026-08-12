# API Structure Overview

## Complete API Hierarchy

```
BASE URL: http://localhost:7410/api
│
├── /admin (Admin Routes - Requires Admin Token)
│   │
│   ├── /banners ✨ NEW
│   │   ├── POST   /                    → Create banner
│   │   ├── GET    /                    → Get all banners (paginated, search)
│   │   ├── GET    /:id                 → Get banner by ID
│   │   ├── PUT    /:id                 → Update banner
│   │   ├── DELETE /:id                 → Delete banner
│   │   └── PATCH  /:id/status          → Update banner status
│   │
│   ├── /products
│   ├── /orders
│   ├── /users
│   └── ... (other admin routes)
│
└── /user (User Routes)
    │
    ├── /banners ✨ NEW
    │   └── GET    /                    → Get active banners (public)
    │
    ├── /recently-viewed ✅ EXISTING
    │   ├── POST   /:productId          → Add/Update recently viewed
    │   ├── GET    /                    → Get recently viewed (paginated)
    │   ├── DELETE /:id                 → Remove specific product
    │   └── DELETE /                    → Clear all recently viewed
    │
    ├── /cart
    ├── /wishlist
    └── ... (other user routes)
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   CLIENT     │
└──────┬───────┘
       │
       │ 1. Login Request
       │ POST /api/admin/login
       ├────────────────────────►┌──────────────────┐
       │                          │  Admin Controller│
       │                          └────────┬─────────┘
       │                                   │
       │                                   │ 2. Verify credentials
       │                                   ├──────────────►┌──────────┐
       │                                   │                │ Database │
       │                          3. JWT   │◄───────────── └──────────┘
       │◄────────────────────────Token    │
       │                          └────────┘
       │
       │ 4. Authenticated Request
       │ GET /api/admin/banners
       │ Header: Authorization: Bearer TOKEN
       ├────────────────────────►┌──────────────────┐
       │                          │  Verify Middleware│
       │                          └────────┬─────────┘
       │                                   │
       │                                   │ 5. Verify Token
       │                                   │
       │                          6. Route │
       │                          to       │
       │                          Controller
       │                          └────────┬─────────┘
       │                                   │
       │                          7. Fetch Data
       │                          ├──────────────►┌──────────┐
       │                          │                │ Database │
       │◄─────────────────────────│◄───────────── └──────────┘
       │    8. Response            │
       │    { success, data }      │
       └─────────────────────────┘
```

---

## Banner Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│              BANNER MANAGEMENT DATA FLOW                     │
└─────────────────────────────────────────────────────────────┘

ADMIN OPERATIONS:
┌────────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│ Admin  │───►│   Route    │───►│ Controller │───►│ Database │
│ Client │    │ Middleware │    │  Logic     │    │ (MongoDB)│
└────────┘    └────────────┘    └────────────┘    └──────────┘
    ▲                                                    │
    │                                                    │
    └────────────────────────────────────────────────────┘
                    Response with data

USER OPERATIONS:
┌────────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│  User  │───►│   Route    │───►│ Controller │───►│ Database │
│ Client │    │  (Public)  │    │  Filter    │    │ (MongoDB)│
└────────┘    └────────────┘    └────────────┘    └──────────┘
    ▲                                 │                  │
    │                                 │                  │
    │                                 ▼                  │
    │                          ┌─────────────┐           │
    │                          │   Filter:   │◄──────────┘
    │                          │ - isActive  │
    │                          │ - Dates     │
    │                          │ - Position  │
    │                          └─────────────┘
    │                                 │
    └─────────────────────────────────┘
              Filtered active banners
```

---

## Recently Viewed Products Flow

```
┌─────────────────────────────────────────────────────────────┐
│          RECENTLY VIEWED PRODUCTS DATA FLOW                  │
└─────────────────────────────────────────────────────────────┘

ADD/UPDATE PRODUCT:
┌────────┐                              ┌──────────────┐
│  User  │─── POST /:productId ────────►│  Controller  │
└────────┘                              └──────┬───────┘
                                               │
                                               ▼
                                        Check Product
                                         Exists?
                                         ┌───┴────┐
                                     Yes │        │ No
                                         ▼        ▼
                                    ┌────────┐ ┌───────┐
                                    │ Update │ │Create │
                                    │Timestamp│ │  New  │
                                    └────┬───┘ └───┬───┘
                                         │         │
                                         └────┬────┘
                                              ▼
                                      Check Count > 20?
                                         ┌───┴────┐
                                     Yes │        │ No
                                         ▼        ▼
                                    ┌────────┐   │
                                    │ Delete │   │
                                    │ Oldest │   │
                                    └────┬───┘   │
                                         └───┬───┘
                                             ▼
                                      Return Success

GET PRODUCTS:
┌────────┐                              ┌──────────────┐
│  User  │─── GET / ──────────────────►│  Controller  │
└────────┘    (page, limit)            └──────┬───────┘
                                               │
                                               ▼
                                        Query Database
                                        - Filter by user
                                        - Sort by viewedAt
                                        - Paginate
                                        - Populate product
                                               │
                                               ▼
                                        Return Products
                                        + Pagination Info
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│    Banner    │
│──────────────│
│ _id          │ Primary Key
│ title        │ String (required)
│ subtitle     │ String
│ image        │ String (required)
│ buttonText   │ String
│ buttonLink   │ String
│ position     │ Number (default: 0)
│ isActive     │ Boolean (default: true)
│ startDate    │ Date
│ endDate      │ Date
│ createdAt    │ Timestamp
│ updatedAt    │ Timestamp
└──────────────┘

Indexes:
- { position: 1 }
- { isActive: 1, startDate: 1, endDate: 1 }


┌──────────────────┐         ┌──────────────┐
│ RecentlyViewed   │         │     User     │
│──────────────────│         │──────────────│
│ _id              │         │ _id          │
│ user             │────────►│ name         │
│ product          │─┐       │ email        │
│ viewedAt         │ │       │ ...          │
│ createdAt        │ │       └──────────────┘
│ updatedAt        │ │
└──────────────────┘ │       ┌──────────────┐
                     │       │   Product    │
Indexes:             │       │──────────────│
- { user: 1,         └──────►│ _id          │
    product: 1 }             │ name         │
  (unique)                   │ price        │
- { user: 1,                 │ ...          │
    viewedAt: -1 }           └──────────────┘
```

---

## Request/Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│              TYPICAL REQUEST/RESPONSE FLOW                   │
└─────────────────────────────────────────────────────────────┘

1. CREATE BANNER (Admin)
   ┌──────────────────────────────────────────────────────┐
   │ REQUEST                                              │
   ├──────────────────────────────────────────────────────┤
   │ POST /api/admin/banners                              │
   │ Headers:                                             │
   │   Authorization: Bearer <admin_token>                │
   │   Content-Type: multipart/form-data                  │
   │ Body:                                                │
   │   title: "Summer Sale"                               │
   │   image: [file]                                      │
   │   position: 1                                        │
   └──────────────────────────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────┐
   │ RESPONSE (201 Created)                               │
   ├──────────────────────────────────────────────────────┤
   │ {                                                    │
   │   "success": true,                                   │
   │   "message": "Banner created successfully",          │
   │   "data": {                                          │
   │     "_id": "60d5f484...",                            │
   │     "title": "Summer Sale",                          │
   │     "image": "uploads/banner-123.jpg",               │
   │     "position": 1,                                   │
   │     ...                                              │
   │   }                                                  │
   │ }                                                    │
   └──────────────────────────────────────────────────────┘

2. GET ACTIVE BANNERS (User)
   ┌──────────────────────────────────────────────────────┐
   │ REQUEST                                              │
   ├──────────────────────────────────────────────────────┤
   │ GET /api/user/banners                                │
   │ Headers: (None required)                             │
   └──────────────────────────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────┐
   │ RESPONSE (200 OK)                                    │
   ├──────────────────────────────────────────────────────┤
   │ {                                                    │
   │   "success": true,                                   │
   │   "message": "Active banners fetched successfully",  │
   │   "data": [                                          │
   │     {                                                │
   │       "_id": "60d5f484...",                          │
   │       "title": "Summer Sale",                        │
   │       "image": "uploads/banner-123.jpg",             │
   │       "position": 1,                                 │
   │       ...                                            │
   │     }                                                │
   │   ]                                                  │
   │ }                                                    │
   └──────────────────────────────────────────────────────┘

3. ADD RECENTLY VIEWED (User)
   ┌──────────────────────────────────────────────────────┐
   │ REQUEST                                              │
   ├──────────────────────────────────────────────────────┤
   │ POST /api/user/recently-viewed/60d5f484...           │
   │ Headers:                                             │
   │   Authorization: Bearer <user_token>                 │
   └──────────────────────────────────────────────────────┘
                           ↓
   ┌──────────────────────────────────────────────────────┐
   │ RESPONSE (200 OK)                                    │
   ├──────────────────────────────────────────────────────┤
   │ {                                                    │
   │   "success": true,                                   │
   │   "message": "Product added to recently viewed"      │
   │ }                                                    │
   └──────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                        │
└─────────────────────────────────────────────────────────────┘

                    ┌───────────────┐
                    │   Request     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Authentication│
                    │   Check       │
                    └───────┬───────┘
                            │
                    ┌───────┴────────┐
                No  │                │  Yes
            ┌───────┤  Valid Token?  ├───────┐
            │       └────────────────┘       │
            ▼                                 ▼
    ┌──────────────┐              ┌──────────────────┐
    │ Return 401   │              │  Validation      │
    │ Unauthorized │              │    Check         │
    └──────────────┘              └────────┬─────────┘
                                           │
                                   ┌───────┴────────┐
                          Invalid  │                │  Valid
                          ┌────────┤  Valid Input?  ├────────┐
                          │        └────────────────┘        │
                          ▼                                  ▼
                  ┌──────────────┐              ┌─────────────────┐
                  │ Return 400   │              │  Database       │
                  │ Bad Request  │              │    Operation    │
                  └──────────────┘              └────────┬────────┘
                                                         │
                                                 ┌───────┴────────┐
                                    Not Found    │                │  Success
                                    ┌────────────┤   Result?      ├──────────┐
                                    │            └────────────────┘          │
                                    ▼                                        ▼
                            ┌──────────────┐                      ┌──────────────┐
                            │ Return 404   │                      │ Return 200   │
                            │  Not Found   │                      │   Success    │
                            └──────────────┘                      └──────────────┘

                            ┌──────────────┐
                            │ Catch Block  │
                            │   Triggers   │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Return 500   │
                            │ Server Error │
                            └──────────────┘
```

---

## File Organization

```
project-root/
│
├── controller/
│   ├── banner.controller.js        ✨ Banner CRUD logic
│   └── recentlyViewed.controller.js   Product view tracking
│
├── model/
│   ├── banner.model.js             ✨ Banner schema
│   └── recentlyViewed.model.js        Recently viewed schema
│
├── routes/
│   ├── Admin/
│   │   ├── index.routes.js         ✏️ Main admin router
│   │   └── banner.routes.js        ✨ Banner admin routes
│   └── User/
│       ├── index.routes.js         ✏️ Main user router
│       ├── banner.routes.js        ✨ Banner user routes
│       └── recentlyViewed.routes.js   Recently viewed routes
│
├── helper/
│   ├── admin.verifyToken.js           Admin auth middleware
│   ├── user.verifyToken.js            User auth middleware
│   ├── image.js                       Image upload helper
│   └── upload.js                      Multer config
│
├── uploads/                           Uploaded images folder
│
└── Documentation/
    ├── BANNER_API_DOCUMENTATION.md    ✨ Complete API docs
    ├── BANNER_TESTING_GUIDE.md        ✨ Testing guide
    ├── FEATURES_README.md             ✨ Feature overview
    ├── IMPLEMENTATION_SUMMARY.md      ✨ Implementation details
    └── API_STRUCTURE.md               ✨ This file
```

---

## Middleware Chain

```
┌─────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE CHAIN                           │
└─────────────────────────────────────────────────────────────┘

Admin Routes:
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌────────────┐
│ Express │───►│  CORS    │───►│ Auth    │───►│ Controller │
│  JSON   │    │ Headers  │    │Verify   │    │  Handler   │
└─────────┘    └──────────┘    └─────────┘    └────────────┘

User Routes (Protected):
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌────────────┐
│ Express │───►│  CORS    │───►│ User    │───►│ Controller │
│  JSON   │    │ Headers  │    │Verify   │    │  Handler   │
└─────────┘    └──────────┘    └─────────┘    └────────────┘

User Routes (Public):
┌─────────┐    ┌──────────┐    ┌────────────┐
│ Express │───►│  CORS    │───►│ Controller │
│  JSON   │    │ Headers  │    │  Handler   │
└─────────┘    └──────────┘    └────────────┘

Upload Routes (Admin):
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌────────┐    ┌────────────┐
│ Express │───►│  CORS    │───►│ Auth    │───►│ Multer │───►│ Controller │
│  JSON   │    │ Headers  │    │Verify   │    │Upload  │    │  Handler   │
└─────────┘    └──────────┘    └─────────┘    └────────┘    └────────────┘
```

---

## HTTP Status Code Usage

```
┌─────────────────────────────────────────────────────────────┐
│                 HTTP STATUS CODE MAPPING                     │
└─────────────────────────────────────────────────────────────┘

Success Codes:
┌──────┬──────────────────┬─────────────────────────────────┐
│ Code │ Status           │ Usage                           │
├──────┼──────────────────┼─────────────────────────────────┤
│ 200  │ OK               │ GET, PUT, DELETE success        │
│ 201  │ Created          │ POST success (new resource)     │
└──────┴──────────────────┴─────────────────────────────────┘

Error Codes:
┌──────┬──────────────────┬─────────────────────────────────┐
│ Code │ Status           │ Usage                           │
├──────┼──────────────────┼─────────────────────────────────┤
│ 400  │ Bad Request      │ Validation errors               │
│      │                  │ Missing required fields         │
│      │                  │ Invalid input format            │
├──────┼──────────────────┼─────────────────────────────────┤
│ 401  │ Unauthorized     │ Missing auth token              │
│      │                  │ Invalid auth token              │
│      │                  │ Expired token                   │
├──────┼──────────────────┼─────────────────────────────────┤
│ 404  │ Not Found        │ Resource doesn't exist          │
│      │                  │ Banner not found                │
│      │                  │ Product not found               │
├──────┼──────────────────┼─────────────────────────────────┤
│ 500  │ Server Error     │ Database errors                 │
│      │                  │ Unhandled exceptions            │
│      │                  │ System failures                 │
└──────┴──────────────────┴─────────────────────────────────┘
```

---

## Quick Reference Commands

```bash
# Start Server
npm start

# Admin Login
curl -X POST http://localhost:7410/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Create Banner
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer TOKEN" \
  -F "title=Test" -F "image=@banner.jpg"

# Get Active Banners
curl http://localhost:7410/api/user/banners

# Add Recently Viewed
curl -X POST http://localhost:7410/api/user/recently-viewed/PRODUCT_ID \
  -H "Authorization: Bearer USER_TOKEN"

# Get Recently Viewed
curl http://localhost:7410/api/user/recently-viewed \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## Legend

```
✨ NEW      - Newly created
✅ EXISTING - Already implemented
✏️ UPDATED  - Modified
🔒 AUTH     - Authentication required
🌐 PUBLIC   - No authentication needed
```

---

For detailed documentation, see:
- **BANNER_API_DOCUMENTATION.md** - Complete API reference
- **BANNER_TESTING_GUIDE.md** - Testing examples
- **FEATURES_README.md** - Feature overview
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
