# Product API Testing Guide

## Base URL
```
http://localhost:7410/api/admin/products
```

## Authentication
All product endpoints require admin authentication:
```
Authorization: Bearer <admin-token>
```

---

# PRODUCT APIs

## 1. Create Product

**POST** `/api/admin/products`

### Request (Form Data with Image)
```
POST http://localhost:7410/api/admin/products
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

productDetail: {"name":"Product Name","category":"675cat123...","hsnCode":"12345678","itemCode":"ITM001","cut":5,"description":"Product description","checkNegativeStock":1}
saleDetails: {"salePrice":1000,"discount":10,"measuringUnit":"piece"}
purchaseDetails: {"wholeshaleAllow":true,"wholeshalePrice":800,"wholeshalePricePercentage":20,"purchasePrice":700,"gstTax":18,"purchaseDesignNo":"PD001","purchaseParty":"675party123..."}
stockDetails: {"openingQuantity":100,"atPrice":700,"atOfDate":1686483200000,"minStockToMaintain":10,"location":"Warehouse A"}
image: [Select File]
```

### Postman Setup
```
Method: POST
URL: http://localhost:7410/api/admin/products
Headers:
  Authorization: Bearer {{admin_token}}
Body (form-data):
  productDetail: (see JSON below)
  saleDetails: (see JSON below)
  purchaseDetails: (see JSON below)
  stockDetails: (see JSON below)
  image: [Select File]
```

### JSON Field Values:

**productDetail:**
```json
{
  "name": "Premium Cotton Shirt",
  "category": "675cat1234567890abcdef0",
  "hsnCode": "62051000",
  "itemCode": "SHIRT001",
  "cut": 5,
  "description": "High quality cotton shirt with premium finish",
  "checkNegativeStock": 1
}
```

**saleDetails:**
```json
{
  "salePrice": 1500,
  "discount": 10,
  "measuringUnit": "piece"
}
```

**purchaseDetails:**
```json
{
  "wholeshaleAllow": true,
  "wholeshalePrice": 1200,
  "wholeshalePricePercentage": 20,
  "purchasePrice": 800,
  "gstTax": 18,
  "purchaseDesignNo": "DES-2024-001",
  "purchaseParty": "675party1234567890abcdef0"
}
```

**stockDetails:**
```json
{
  "openingQuantity": 100,
  "atPrice": 800,
  "atOfDate": 1686483200000,
  "minStockToMaintain": 20,
  "location": "Warehouse A - Section B"
}
```

### Success Response (201)
```json
{
  "message": "Product created successfully....",
  "product": {
    "_id": "675prod1234567890abcdef0",
    "productDetail": {
      "name": "Premium Cotton Shirt",
      "category": {
        "_id": "675cat1234567890abcdef0",
        "name": "Shirts"
      },
      "hsnCode": "62051000",
      "itemCode": "SHIRT001",
      "cut": 5,
      "description": "High quality cotton shirt with premium finish",
      "image": "uploads/product-1686483500000.jpg",
      "checkNegativeStock": 1
    },
    "saleDetails": {
      "salePrice": 1500,
      "discount": 10,
      "measuringUnit": "piece"
    },
    "purchaseDetails": {
      "wholeshaleAllow": true,
      "wholeshalePrice": 1200,
      "wholeshalePricePercentage": 20,
      "purchasePrice": 800,
      "gstTax": 18,
      "purchaseDesignNo": "DES-2024-001",
      "purchaseParty": {
        "_id": "675party1234567890abcdef0",
        "name": "ABC Suppliers"
      }
    },
    "stockDetails": {
      "openingQuantity": 100,
      "atPrice": 800,
      "atOfDate": 1686483200000,
      "minStockToMaintain": 20,
      "location": "Warehouse A - Section B"
    },
    "createdAt": "2026-06-10T10:00:00.000Z",
    "updatedAt": "2026-06-10T10:00:00.000Z"
  }
}
```

### Error Responses

**400 - Validation error**
```json
{
  "success": false,
  "message": "Validation error details"
}
```

**401 - Unauthorized**
```json
{
  "message": "Authorization denied: No token provided"
}
```

**500 - Server error**
```json
{
  "message": "Internal server error"
}
```

---

## 2. Get All Products

**GET** `/api/admin/products`

### Request
```
GET http://localhost:7410/api/admin/products
Authorization: Bearer <admin-token>
```

### Postman Setup
```
Method: GET
URL: http://localhost:7410/api/admin/products
Headers:
  Authorization: Bearer {{admin_token}}
```

### Success Response (200)
```json
{
  "message": "Products fetched successfully....",
  "products": [
    {
      "_id": "675prod1234567890abcdef0",
      "productDetail": {
        "name": "Premium Cotton Shirt",
        "category": {
          "_id": "675cat1234567890abcdef0",
          "name": "Shirts"
        },
        "hsnCode": "62051000",
        "itemCode": "SHIRT001",
        "cut": 5,
        "description": "High quality cotton shirt",
        "image": "uploads/product-1686483500000.jpg",
        "checkNegativeStock": 1
      },
      "saleDetails": {
        "salePrice": 1500,
        "discount": 10,
        "measuringUnit": "piece"
      },
      "purchaseDetails": {
        "wholeshaleAllow": true,
        "wholeshalePrice": 1200,
        "wholeshalePricePercentage": 20,
        "purchasePrice": 800,
        "gstTax": 18,
        "purchaseDesignNo": "DES-2024-001",
        "purchaseParty": {
          "_id": "675party1234567890abcdef0",
          "name": "ABC Suppliers"
        }
      },
      "stockDetails": {
        "openingQuantity": 100,
        "atPrice": 800,
        "atOfDate": 1686483200000,
        "minStockToMaintain": 20,
        "location": "Warehouse A - Section B"
      },
      "createdAt": "2026-06-10T10:00:00.000Z",
      "updatedAt": "2026-06-10T10:00:00.000Z"
    }
  ]
}
```

### Error Response

**401 - Unauthorized**
```json
{
  "message": "Authorization denied: No token provided"
}
```

**500 - Server error**
```json
{
  "message": "Internal server error"
}
```

---

## 3. Get Single Product

**GET** `/api/admin/products/:id`

### Request
```
GET http://localhost:7410/api/admin/products/675prod1234567890abcdef0
Authorization: Bearer <admin-token>
```

### Postman Setup
```
Method: GET
URL: http://localhost:7410/api/admin/products/675prod1234567890abcdef0
Headers:
  Authorization: Bearer {{admin_token}}
```

### Success Response (200)
```json
{
  "message": "Product fetched successfully....",
  "product": {
    "_id": "675prod1234567890abcdef0",
    "productDetail": {
      "name": "Premium Cotton Shirt",
      "category": {
        "_id": "675cat1234567890abcdef0",
        "name": "Shirts",
        "description": "All types of shirts"
      },
      "hsnCode": "62051000",
      "itemCode": "SHIRT001",
      "cut": 5,
      "description": "High quality cotton shirt with premium finish",
      "image": "uploads/product-1686483500000.jpg",
      "checkNegativeStock": 1
    },
    "saleDetails": {
      "salePrice": 1500,
      "discount": 10,
      "measuringUnit": "piece"
    },
    "purchaseDetails": {
      "wholeshaleAllow": true,
      "wholeshalePrice": 1200,
      "wholeshalePricePercentage": 20,
      "purchasePrice": 800,
      "gstTax": 18,
      "purchaseDesignNo": "DES-2024-001",
      "purchaseParty": {
        "_id": "675party1234567890abcdef0",
        "name": "ABC Suppliers",
        "email": "abc@suppliers.com",
        "phone": "1234567890"
      }
    },
    "stockDetails": {
      "openingQuantity": 100,
      "atPrice": 800,
      "atOfDate": 1686483200000,
      "minStockToMaintain": 20,
      "location": "Warehouse A - Section B"
    },
    "createdAt": "2026-06-10T10:00:00.000Z",
    "updatedAt": "2026-06-10T10:00:00.000Z"
  }
}
```

### Error Responses

**404 - Product not found**
```json
{
  "message": "Product not found"
}
```

**401 - Unauthorized**
```json
{
  "message": "Authorization denied: No token provided"
}
```

**500 - Server error**
```json
{
  "message": "Internal server error"
}
```

---

## 4. Update Product

**PUT** `/api/admin/products/:id`

### Request (Form Data)
```
PUT http://localhost:7410/api/admin/products/675prod1234567890abcdef0
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

productDetail: {"name":"Updated Product Name","hsnCode":"62051000","itemCode":"SHIRT001","description":"Updated description"}
saleDetails: {"salePrice":1800,"discount":15}
stockDetails: {"openingQuantity":150}
image: [Select New File - Optional]
```

### Postman Setup
```
Method: PUT
URL: http://localhost:7410/api/admin/products/675prod1234567890abcdef0
Headers:
  Authorization: Bearer {{admin_token}}
Body (form-data):
  productDetail: {"name":"Updated Product Name","description":"Updated description"}
  saleDetails: {"salePrice":1800,"discount":15}
  stockDetails: {"openingQuantity":150}
  image: [Select File - Optional]
```

### Minimal Update Example (Only Name):
```
productDetail: {"name":"New Product Name"}
```

### Success Response (200)
```json
{
  "message": "Product updated successfully....",
  "product": {
    "_id": "675prod1234567890abcdef0",
    "productDetail": {
      "name": "Updated Product Name",
      "category": {
        "_id": "675cat1234567890abcdef0",
        "name": "Shirts"
      },
      "hsnCode": "62051000",
      "itemCode": "SHIRT001",
      "cut": 5,
      "description": "Updated description",
      "image": "uploads/product-1686483800000.jpg",
      "checkNegativeStock": 1
    },
    "saleDetails": {
      "salePrice": 1800,
      "discount": 15,
      "measuringUnit": "piece"
    },
    "purchaseDetails": {
      "wholeshaleAllow": true,
      "wholeshalePrice": 1200,
      "wholeshalePricePercentage": 20,
      "purchasePrice": 800,
      "gstTax": 18,
      "purchaseDesignNo": "DES-2024-001",
      "purchaseParty": {
        "_id": "675party1234567890abcdef0",
        "name": "ABC Suppliers"
      }
    },
    "stockDetails": {
      "openingQuantity": 150,
      "atPrice": 800,
      "atOfDate": 1686483200000,
      "minStockToMaintain": 20,
      "location": "Warehouse A - Section B"
    },
    "createdAt": "2026-06-10T10:00:00.000Z",
    "updatedAt": "2026-06-10T12:00:00.000Z"
  }
}
```

### Error Responses

**400 - Validation error**
```json
{
  "success": false,
  "message": "Validation error details"
}
```

**404 - Product not found**
```json
{
  "message": "Product not found"
}
```

**401 - Unauthorized**
```json
{
  "message": "Authorization denied: No token provided"
}
```

**500 - Server error**
```json
{
  "message": "Internal server error"
}
```

---

## 5. Delete Product

**DELETE** `/api/admin/products/:id`

### Request
```
DELETE http://localhost:7410/api/admin/products/675prod1234567890abcdef0
Authorization: Bearer <admin-token>
```

### Postman Setup
```
Method: DELETE
URL: http://localhost:7410/api/admin/products/675prod1234567890abcdef0
Headers:
  Authorization: Bearer {{admin_token}}
```

### Success Response (200)
```json
{
  "message": "Product deleted successfully...."
}
```

### Error Responses

**404 - Product not found**
```json
{
  "message": "Product not found"
}
```

**401 - Unauthorized**
```json
{
  "message": "Authorization denied: No token provided"
}
```

**500 - Server error**
```json
{
  "message": "Internal server error"
}
```

---

# Field Specifications

## Product Detail Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Product name |
| category | ObjectId | No | Category reference |
| hsnCode | String | Yes | HSN code for taxation |
| itemCode | String | Yes | Unique item code |
| cut | Number | No | Cut value |
| description | String | No | Product description |
| image | String | No | Product image path |
| checkNegativeStock | Number | No | 1=Yes, 2=No (default: 1) |

## Sale Details Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| salePrice | Number | No | Selling price (default: 0) |
| discount | Number | No | Discount amount (default: 0) |
| measuringUnit | String | No | "piece" or "meter" |

## Purchase Details Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| wholeshaleAllow | Boolean | No | Allow wholesale (default: false) |
| wholeshalePrice | Number | No | Wholesale price |
| wholeshalePricePercentage | Number | No | Wholesale price % |
| purchasePrice | Number | No | Purchase price |
| gstTax | Number | No | GST tax percentage |
| purchaseDesignNo | String | Yes | Purchase design number |
| purchaseParty | ObjectId | Yes | Supplier party reference |

## Stock Details Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| openingQuantity | Number | No | Opening stock (default: 0) |
| atPrice | Number | No | Price at opening (default: 0) |
| atOfDate | Number | No | Date timestamp (default: 0) |
| minStockToMaintain | Number | No | Minimum stock level (default: 0) |
| location | String | No | Storage location |

---

# Complete Testing Workflow

## Step 1: Admin Login
```json
POST http://localhost:7410/api/admin/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

Save the token from response!
```

## Step 2: Create Category (If needed)
```json
POST http://localhost:7410/api/admin/categories
Authorization: Bearer <token>
{
  "name": "Shirts",
  "description": "All types of shirts"
}

Save the category ID!
```

## Step 3: Create Party (Supplier)
```json
POST http://localhost:7410/api/admin/parties
Authorization: Bearer <token>
{
  "name": "ABC Suppliers",
  "email": "abc@suppliers.com",
  "phone": "1234567890"
}

Save the party ID!
```

## Step 4: Create Product
```
POST http://localhost:7410/api/admin/products
Authorization: Bearer <token>
Body (form-data):
  productDetail: {"name":"Cotton Shirt","category":"<category-id>","hsnCode":"62051000","itemCode":"SHIRT001"}
  saleDetails: {"salePrice":1500,"discount":10,"measuringUnit":"piece"}
  purchaseDetails: {"purchaseDesignNo":"DES001","purchaseParty":"<party-id>"}
  stockDetails: {"openingQuantity":100}
  image: [Select File]
```

## Step 5: Get All Products
```
GET http://localhost:7410/api/admin/products
Authorization: Bearer <token>
```

## Step 6: Get Single Product
```
GET http://localhost:7410/api/admin/products/<product-id>
Authorization: Bearer <token>
```

## Step 7: Update Product
```
PUT http://localhost:7410/api/admin/products/<product-id>
Authorization: Bearer <token>
Body (form-data):
  productDetail: {"name":"Updated Product Name"}
  saleDetails: {"salePrice":1800}
```

## Step 8: Delete Product
```
DELETE http://localhost:7410/api/admin/products/<product-id>
Authorization: Bearer <token>
```

---

# Postman Environment Variables

Set these in Postman environment:

```
admin_token      = (set after admin login)
base_url         = http://localhost:7410
category_id      = (set after creating category)
party_id         = (set after creating party)
product_id       = (set after creating product)
```

---

# Common Issues & Solutions

## Issue 1: "Validation error"
**Solution:** Check that all required fields are provided in correct format

## Issue 2: "Category not found"
**Solution:** First create a category or set category to null

## Issue 3: "Purchase party not found"
**Solution:** First create a party (supplier)

## Issue 4: "Authorization denied"
**Solution:** Add Bearer token in Authorization header

## Issue 5: "Image not uploading"
**Solution:** Use form-data in Postman, not raw JSON

## Issue 6: "JSON parse error in productDetail"
**Solution:** Ensure JSON strings are properly formatted

---

# Testing Checklist

## Product Creation
- [ ] Create product with all fields
- [ ] Create product with minimal required fields
- [ ] Create product with image
- [ ] Create product without image
- [ ] Verify category population
- [ ] Verify party population

## Product Retrieval
- [ ] Get all products
- [ ] Get single product by ID
- [ ] Verify populated references
- [ ] Get non-existent product (404)

## Product Update
- [ ] Update product name
- [ ] Update product price
- [ ] Update product image
- [ ] Update stock quantity
- [ ] Update multiple fields at once
- [ ] Update non-existent product (404)

## Product Deletion
- [ ] Delete existing product
- [ ] Delete non-existent product (404)
- [ ] Verify product is removed from database

## Authorization
- [ ] Access without token (401)
- [ ] Access with expired token (401)
- [ ] Access with invalid token (401)
- [ ] Access with valid admin token (200)

---

# API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/products` | Yes | Create product |
| GET | `/api/admin/products` | Yes | Get all products |
| GET | `/api/admin/products/:id` | Yes | Get single product |
| PUT | `/api/admin/products/:id` | Yes | Update product |
| DELETE | `/api/admin/products/:id` | Yes | Delete product |

---

# Sample Product Data

## Example 1: Cotton Shirt
```json
{
  "productDetail": {
    "name": "Premium Cotton Shirt",
    "category": "675cat123...",
    "hsnCode": "62051000",
    "itemCode": "SHIRT001",
    "cut": 5,
    "description": "High quality cotton shirt",
    "checkNegativeStock": 1
  },
  "saleDetails": {
    "salePrice": 1500,
    "discount": 10,
    "measuringUnit": "piece"
  },
  "purchaseDetails": {
    "wholeshaleAllow": true,
    "wholeshalePrice": 1200,
    "purchasePrice": 800,
    "gstTax": 18,
    "purchaseDesignNo": "DES-2024-001",
    "purchaseParty": "675party123..."
  },
  "stockDetails": {
    "openingQuantity": 100,
    "atPrice": 800,
    "minStockToMaintain": 20,
    "location": "Warehouse A"
  }
}
```

## Example 2: Fabric (Measured in Meters)
```json
{
  "productDetail": {
    "name": "Cotton Fabric",
    "hsnCode": "52081100",
    "itemCode": "FAB001",
    "description": "100% cotton fabric",
    "checkNegativeStock": 1
  },
  "saleDetails": {
    "salePrice": 200,
    "discount": 0,
    "measuringUnit": "meter"
  },
  "purchaseDetails": {
    "purchasePrice": 150,
    "gstTax": 5,
    "purchaseDesignNo": "FAB-2024-001",
    "purchaseParty": "675party123..."
  },
  "stockDetails": {
    "openingQuantity": 500,
    "atPrice": 150,
    "minStockToMaintain": 100,
    "location": "Warehouse B"
  }
}
```

---

# Notes

1. **Image Upload:** Use form-data, not raw JSON when uploading images
2. **Nested JSON:** Send nested objects as JSON strings in form-data
3. **Number Parsing:** API automatically parses string numbers to Number type
4. **Stock Check:** checkNegativeStock=1 means stock validation is ON
5. **Measuring Units:** Only "piece" or "meter" are valid
6. **Timestamps:** Use milliseconds for dates (e.g., 1686483200000)
7. **Optional Fields:** Many fields have default values, check field specs
