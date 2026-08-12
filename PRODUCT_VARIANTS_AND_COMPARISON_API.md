# Product Variants and Comparison API Documentation

## Overview
This document covers the upgraded Product Module with Product Variants and Product Comparison features.

---

## Product Variants

### What are Product Variants?
Product variants allow a single product to have multiple variations with different attributes like color, size, price, stock, and images.

### Variant Schema
```javascript
{
  sku: String (required, unique),
  color: String,
  size: String,
  weight: String,
  images: [String],
  salePrice: Number (required, min: 0),
  purchasePrice: Number (required, min: 0),
  stock: Number (default: 0, min: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Features
✅ Multiple variants per product  
✅ Each variant has independent pricing  
✅ Each variant has independent stock management  
✅ Each variant can have multiple images  
✅ Unique SKU validation (across all products)  
✅ Duplicate SKU prevention  
✅ Variant-level activation/deactivation  

---

## API Endpoints

### 1. Create Product with Variants

**Endpoint:** `POST /api/admin/products`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "productDetail": {
    "name": "Premium T-Shirt",
    "category": "60d5f484f8d2e123456789ab",
    "hsnCode": "HSN001",
    "itemCode": "ITEM001",
    "description": "High quality cotton t-shirt"
  },
  "saleDetails": {
    "salePrice": 500,
    "discount": 10,
    "measuringUnit": "piece"
  },
  "purchaseDetails": {
    "purchasePrice": 300,
    "gstTax": 18,
    "purchaseDesignNo": "DES001",
    "purchaseParty": "60d5f484f8d2e123456789ac"
  },
  "stockDetails": {
    "openingQuantity": 100,
    "atPrice": 300,
    "minStockToMaintain": 10
  },
  "variants": [
    {
      "sku": "TSHIRT-RED-M",
      "color": "Red",
      "size": "M",
      "weight": "150g",
      "images": ["uploads/red-m-1.jpg", "uploads/red-m-2.jpg"],
      "salePrice": 500,
      "purchasePrice": 300,
      "stock": 50,
      "isActive": true
    },
    {
      "sku": "TSHIRT-BLUE-L",
      "color": "Blue",
      "size": "L",
      "weight": "160g",
      "images": ["uploads/blue-l-1.jpg"],
      "salePrice": 550,
      "purchasePrice": 320,
      "stock": 30,
      "isActive": true
    }
  ]
}
```

**Success Response (201):**
```json
{
  "message": "Product created successfully....",
  "product": {
    "_id": "60d5f484f8d2e123456789ad",
    "productDetail": {
      "name": "Premium T-Shirt",
      "category": {
        "_id": "60d5f484f8d2e123456789ab",
        "name": "Clothing"
      },
      "hsnCode": "HSN001",
      "itemCode": "ITEM001",
      "description": "High quality cotton t-shirt"
    },
    "variants": [
      {
        "_id": "60d5f484f8d2e123456789ae",
        "sku": "TSHIRT-RED-M",
        "color": "Red",
        "size": "M",
        "weight": "150g",
        "images": ["uploads/red-m-1.jpg", "uploads/red-m-2.jpg"],
        "salePrice": 500,
        "purchasePrice": 300,
        "stock": 50,
        "isActive": true,
        "createdAt": "2024-06-11T10:30:00.000Z",
        "updatedAt": "2024-06-11T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-06-11T10:30:00.000Z",
    "updatedAt": "2024-06-11T10:30:00.000Z"
  }
}
```

**Error Responses:**

Duplicate SKU within same request:
```json
{
  "success": false,
  "message": "Duplicate SKUs found in variants"
}
```

SKU already exists in database:
```json
{
  "success": false,
  "message": "SKUs already exist: TSHIRT-RED-M, TSHIRT-BLUE-L"
}
```

---

### 2. Update Product with Variants

**Endpoint:** `PUT /api/admin/products/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body:**
Same as create, all fields optional. Only include fields you want to update.

**Success Response (200):**
```json
{
  "message": "Product updated successfully....",
  "product": { ... }
}
```

**Notes:**
- SKU validation applies (no duplicates)
- Existing SKUs (from the same product) are excluded from validation
- Can add new variants, update existing ones

---

### 3. Get Product with Variants

**Endpoint:** `GET /api/admin/products/:id`  
**Endpoint:** `GET /api/user/products/:id`

**Headers:**
```
Authorization: Bearer <admin_token> (for admin)
```

**Success Response (200):**
```json
{
  "message": "Product fetched successfully....",
  "product": {
    "_id": "60d5f484f8d2e123456789ad",
    "productDetail": { ... },
    "saleDetails": { ... },
    "purchaseDetails": { ... },
    "stockDetails": { ... },
    "variants": [
      {
        "_id": "60d5f484f8d2e123456789ae",
        "sku": "TSHIRT-RED-M",
        "color": "Red",
        "size": "M",
        "weight": "150g",
        "images": ["uploads/red-m-1.jpg"],
        "salePrice": 500,
        "purchasePrice": 300,
        "stock": 50,
        "isActive": true,
        "createdAt": "2024-06-11T10:30:00.000Z",
        "updatedAt": "2024-06-11T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-06-11T10:30:00.000Z",
    "updatedAt": "2024-06-11T10:30:00.000Z"
  }
}
```

---

### 4. Get All Products with Variants (Paginated)

**Endpoint:** `GET /api/admin/products`  
**Endpoint:** `GET /api/user/products`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page
- `search` (optional) - Search by product name

**Example:**
```
GET /api/admin/products?page=1&limit=20&search=shirt
```

**Success Response (200):**
```json
{
  "message": "Products fetched successfully....",
  "products": [
    {
      "_id": "60d5f484f8d2e123456789ad",
      "productDetail": { ... },
      "variants": [ ... ]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## Product Comparison API

### Compare Products

**Endpoint:** `GET /api/admin/products/compare`  
**Endpoint:** `GET /api/user/products/compare`

**Query Parameters:**
- `ids` (required) - Comma-separated product IDs (minimum 2, maximum 4)

**Example:**
```
GET /api/admin/products/compare?ids=60d5f484f8d2e123456789a1,60d5f484f8d2e123456789a2,60d5f484f8d2e123456789a3
```

**Validation Rules:**
- ✅ Minimum 2 products required
- ✅ Maximum 4 products allowed
- ✅ All IDs must be valid MongoDB ObjectIds
- ✅ All products must exist in database

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "60d5f484f8d2e123456789a1",
        "name": "Premium T-Shirt",
        "category": "Clothing",
        "categoryId": "60d5f484f8d2e123456789ab",
        "image": "uploads/tshirt.jpg",
        "description": "High quality cotton t-shirt",
        "salePrice": 500,
        "discount": 10,
        "stock": 100,
        "variants": [
          {
            "_id": "60d5f484f8d2e123456789ae",
            "sku": "TSHIRT-RED-M",
            "color": "Red",
            "size": "M",
            "weight": "150g",
            "images": ["uploads/red-m-1.jpg"],
            "salePrice": 500,
            "purchasePrice": 300,
            "stock": 50,
            "isActive": true,
            "createdAt": "2024-06-11T10:30:00.000Z",
            "updatedAt": "2024-06-11T10:30:00.000Z"
          }
        ],
        "variantCount": 2,
        "totalVariantStock": 80,
        "createdAt": "2024-06-11T10:30:00.000Z"
      },
      {
        "_id": "60d5f484f8d2e123456789a2",
        "name": "Classic Jeans",
        "category": "Clothing",
        "categoryId": "60d5f484f8d2e123456789ab",
        "image": "uploads/jeans.jpg",
        "description": "Comfortable denim jeans",
        "salePrice": 1200,
        "discount": 15,
        "stock": 75,
        "variants": [
          {
            "_id": "60d5f484f8d2e123456789af",
            "sku": "JEANS-BLUE-32",
            "color": "Blue",
            "size": "32",
            "weight": "400g",
            "images": ["uploads/jeans-32.jpg"],
            "salePrice": 1200,
            "purchasePrice": 800,
            "stock": 40,
            "isActive": true,
            "createdAt": "2024-06-11T11:00:00.000Z",
            "updatedAt": "2024-06-11T11:00:00.000Z"
          }
        ],
        "variantCount": 3,
        "totalVariantStock": 100,
        "createdAt": "2024-06-11T11:00:00.000Z"
      }
    ],
    "comparedCount": 2
  }
}
```

**Error Responses:**

Missing IDs:
```json
{
  "success": false,
  "message": "Product IDs are required"
}
```

Too few products:
```json
{
  "success": false,
  "message": "Minimum 2 products required for comparison"
}
```

Too many products:
```json
{
  "success": false,
  "message": "Maximum 4 products allowed for comparison"
}
```

Invalid product IDs:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Invalid product IDs: invalid-id-1, invalid-id-2"
    }
  ]
}
```

Products not found:
```json
{
  "success": false,
  "message": "Products not found: 60d5f484f8d2e123456789a9"
}
```

---

## Comparison Data Fields

Each product in the comparison includes:

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Product ID |
| name | String | Product name |
| category | String | Category name |
| categoryId | ObjectId | Category ID |
| image | String | Product main image |
| description | String | Product description |
| salePrice | Number | Base sale price |
| discount | Number | Discount percentage |
| stock | Number | Base stock quantity |
| variants | Array | All product variants |
| variantCount | Number | Total number of variants |
| totalVariantStock | Number | Sum of all variant stocks |
| createdAt | Date | Product creation date |

---

## Testing Examples

### Using cURL

#### 1. Create Product with Variants
```bash
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "productDetail={\"name\":\"T-Shirt\",\"hsnCode\":\"HSN001\",\"itemCode\":\"ITEM001\",\"category\":\"60d5f484f8d2e123456789ab\"}" \
  -F "saleDetails={\"salePrice\":500,\"discount\":10}" \
  -F "purchaseDetails={\"purchasePrice\":300,\"gstTax\":18,\"purchaseDesignNo\":\"DES001\",\"purchaseParty\":\"60d5f484f8d2e123456789ac\"}" \
  -F "stockDetails={\"openingQuantity\":100}" \
  -F "variants=[{\"sku\":\"TSHIRT-RED-M\",\"color\":\"Red\",\"size\":\"M\",\"salePrice\":500,\"purchasePrice\":300,\"stock\":50}]" \
  -F "image=@tshirt.jpg"
```

#### 2. Get Products with Pagination and Search
```bash
curl -X GET "http://localhost:7410/api/admin/products?page=1&limit=10&search=shirt" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 3. Compare Products
```bash
curl -X GET "http://localhost:7410/api/admin/products/compare?ids=60d5f484f8d2e123456789a1,60d5f484f8d2e123456789a2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 4. Compare Products (User)
```bash
curl -X GET "http://localhost:7410/api/user/products/compare?ids=60d5f484f8d2e123456789a1,60d5f484f8d2e123456789a2"
```

### Using Postman

#### Create Product with Variants
1. **Method:** POST
2. **URL:** `{{base_url}}/api/admin/products`
3. **Headers:**
   - `Authorization`: `Bearer {{admin_token}}`
4. **Body (form-data):**
   ```
   productDetail: {"name":"T-Shirt","hsnCode":"HSN001","itemCode":"ITEM001"}
   saleDetails: {"salePrice":500,"discount":10}
   purchaseDetails: {"purchasePrice":300,"gstTax":18,"purchaseDesignNo":"DES001","purchaseParty":"60d5f484f8d2e123456789ac"}
   variants: [{"sku":"TSHIRT-RED-M","color":"Red","size":"M","salePrice":500,"purchasePrice":300,"stock":50}]
   image: [select file]
   ```

#### Compare Products
1. **Method:** GET
2. **URL:** `{{base_url}}/api/admin/products/compare?ids=ID1,ID2,ID3`
3. **Headers:**
   - `Authorization`: `Bearer {{admin_token}}`

---

## Variant Management Best Practices

### 1. SKU Naming Convention
Use a consistent format for SKUs:
```
PRODUCT-COLOR-SIZE
PRODUCT-ATTRIBUTE1-ATTRIBUTE2

Examples:
TSHIRT-RED-M
JEANS-BLUE-32
SHOE-BLACK-9
```

### 2. Stock Management
- Base product has `stockDetails.openingQuantity`
- Each variant has independent `stock`
- Total available stock = sum of all variant stocks

### 3. Pricing Strategy
- Base product has `saleDetails.salePrice`
- Each variant can override with its own `salePrice`
- Variant pricing is independent and can be higher or lower

### 4. Image Management
- Base product has main `productDetail.image`
- Each variant can have multiple images in `images[]`
- Use variant images to show color/size specific views

### 5. Variant Activation
- Set `isActive: false` to hide a variant without deleting it
- Useful for seasonal items or out-of-stock variants
- Maintains historical data

---

## Database Indexes

Optimized indexes for performance:

```javascript
// Variant level
{ sku: 1 } - unique index

// Product level
{ 'productDetail.name': 1 }
{ 'productDetail.category': 1 }
{ createdAt: -1 }
```

---

## Validation Rules

### Variant Validation
- ✅ SKU: Required, unique, max 100 characters
- ✅ Color: Optional, max 50 characters
- ✅ Size: Optional, max 50 characters
- ✅ Weight: Optional, max 50 characters
- ✅ Images: Optional array of strings
- ✅ Sale Price: Required, >= 0
- ✅ Purchase Price: Required, >= 0
- ✅ Stock: Optional, >= 0, default 0
- ✅ isActive: Optional boolean, default true

### Comparison Validation
- ✅ IDs parameter required
- ✅ Minimum 2 product IDs
- ✅ Maximum 4 product IDs
- ✅ All IDs must be valid MongoDB ObjectIds
- ✅ All products must exist

---

## Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request:** Validation errors, invalid parameters
- **404 Not Found:** Product not found
- **500 Internal Server Error:** Server errors

Consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## Response Format

All responses follow consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Operation message",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

---

## File Structure

```
project-root/
├── model/
│   └── product.model.js          ✏️ Updated with variants schema
├── controller/
│   └── product.controller.js     ✏️ Updated with comparison & variant logic
├── routes/
│   ├── Admin/
│   │   └── product.routes.js     ✏️ Updated with compare route
│   └── User/
│       └── product.routes.js     ✨ New - public product routes
├── middleware/
│   └── productValidation.js      ✨ New - validation middleware
└── PRODUCT_VARIANTS_AND_COMPARISON_API.md  ✨ This file
```

---

## Migration Notes

If you have existing products without variants:

1. Existing products will continue to work
2. `variants` array is optional
3. Add variants incrementally as needed
4. No data migration required

---

## Future Enhancements

Potential features to add:

- Bulk variant operations
- Variant inventory tracking
- Variant-specific discounts
- Variant filtering in product list
- Low stock alerts per variant
- Variant analytics

---

## Support

For issues or questions:
1. Check this documentation
2. Review example requests
3. Check server logs for detailed errors
4. Verify authentication tokens
5. Validate product IDs and SKUs

---

**Last Updated:** June 11, 2026  
**Version:** 2.0  
**Status:** Production Ready
