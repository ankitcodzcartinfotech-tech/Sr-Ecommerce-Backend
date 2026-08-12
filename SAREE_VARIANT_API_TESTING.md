# Saree Variant API Testing Guide

## Quick Start

Complete testing guide for Saree Product Variants and Comparison APIs.

---

## Prerequisites

1. ✅ Server running on `http://localhost:7410`
2. ✅ Admin token from login
3. ✅ Valid category ID (Saree category)
4. ✅ Valid party ID
5. ✅ Test saree images

---

## Step 1: Get Admin Token

```bash
curl -X POST http://localhost:7410/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**💾 Save this token as `YOUR_ADMIN_TOKEN` for next steps.**

---

## Step 2: Create Banarasi Silk Saree with Color Variants

```bash
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'productDetail={"name":"Banarasi Silk Saree","hsnCode":"HSN5407","itemCode":"SAREE-001","category":"CATEGORY_ID","description":"Premium Banarasi silk saree with traditional zari work"}' \
  -F 'saleDetails={"salePrice":3000,"discount":10,"measuringUnit":"piece"}' \
  -F 'purchaseDetails={"purchasePrice":1800,"gstTax":5,"purchaseDesignNo":"BAN-001","purchaseParty":"PARTY_ID"}' \
  -F 'stockDetails={"openingQuantity":50,"minStockToMaintain":5}' \
  -F 'variants=[{"sku":"BAN-RED-TRAD","color":"Red","fabric":"Pure Silk","design":"Traditional Zari","salePrice":2999,"purchasePrice":1800,"stock":10},{"sku":"BAN-BLUE-TRAD","color":"Blue","fabric":"Pure Silk","design":"Traditional Zari","salePrice":3199,"purchasePrice":1900,"stock":15},{"sku":"BAN-GREEN-TRAD","color":"Green","fabric":"Pure Silk","design":"Traditional Zari","salePrice":3199,"purchasePrice":1900,"stock":8}]' \
  -F "image=@saree-banarasi.jpg"
```

**Expected Response (201):**
```json
{
  "message": "Product created successfully....",
  "product": {
    "_id": "60d5f484f8d2e123456789ad",
    "productDetail": {
      "name": "Banarasi Silk Saree",
      "description": "Premium Banarasi silk saree with traditional zari work"
    },
    "variants": [
      {
        "_id": "...",
        "sku": "BAN-RED-TRAD",
        "color": "Red",
        "fabric": "Pure Silk",
        "design": "Traditional Zari",
        "salePrice": 2999,
        "purchasePrice": 1800,
        "stock": 10,
        "isActive": true
      }
    ]
  }
}
```

**💾 Save product ID for later tests.**

---

## Step 3: Create Cotton Saree with Different Fabrics

```bash
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'productDetail={"name":"Cotton Saree Collection","hsnCode":"HSN5208","itemCode":"SAREE-002","category":"CATEGORY_ID"}' \
  -F 'saleDetails={"salePrice":899,"discount":5}' \
  -F 'purchaseDetails={"purchasePrice":450,"gstTax":5,"purchaseDesignNo":"COT-001","purchaseParty":"PARTY_ID"}' \
  -F 'stockDetails={"openingQuantity":100}' \
  -F 'variants=[{"sku":"COT-PINK-BP","color":"Pink","fabric":"Cotton","design":"Block Print","salePrice":899,"purchasePrice":450,"stock":20},{"sku":"COT-YELLOW-BP","color":"Yellow","fabric":"Cotton","design":"Block Print","salePrice":899,"purchasePrice":450,"stock":18},{"sku":"COT-WHITE-EMB","color":"White","fabric":"Cotton","design":"Embroidered","salePrice":1299,"purchasePrice":650,"stock":12}]'
```

**Expected Response (201):**
Product with 3 cotton saree variants created.

---

## Step 4: Create Designer Wedding Saree

```bash
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'productDetail={"name":"Designer Wedding Saree","hsnCode":"HSN5407","itemCode":"SAREE-003","category":"CATEGORY_ID"}' \
  -F 'saleDetails={"salePrice":8999,"discount":0}' \
  -F 'purchaseDetails={"purchasePrice":5000,"gstTax":12,"purchaseDesignNo":"DES-001","purchaseParty":"PARTY_ID"}' \
  -F 'stockDetails={"openingQuantity":15}' \
  -F 'variants=[{"sku":"DES-MAROON-HW","color":"Maroon","fabric":"Georgette","design":"Heavy Work","salePrice":8999,"purchasePrice":5000,"stock":5},{"sku":"DES-GOLD-SEQ","color":"Golden","fabric":"Georgette","design":"Sequin Work","salePrice":9999,"purchasePrice":5500,"stock":3}]'
```

---

## Step 5: Test Duplicate SKU Prevention

Try creating a saree with existing SKU:

```bash
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'productDetail={"name":"Another Saree","hsnCode":"HSN5407","itemCode":"SAREE-004","category":"CATEGORY_ID"}' \
  -F 'saleDetails={"salePrice":2500}' \
  -F 'purchaseDetails={"purchasePrice":1500,"gstTax":5,"purchaseDesignNo":"TEST-001","purchaseParty":"PARTY_ID"}' \
  -F 'variants=[{"sku":"BAN-RED-TRAD","color":"Orange","fabric":"Silk","design":"Floral","salePrice":2500,"purchasePrice":1500,"stock":10}]'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "SKUs already exist: BAN-RED-TRAD"
}
```

---

## Step 6: Get Saree Product with Variants

```bash
curl -X GET http://localhost:7410/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "message": "Product fetched successfully....",
  "product": {
    "_id": "...",
    "productDetail": {
      "name": "Banarasi Silk Saree"
    },
    "variants": [
      {
        "sku": "BAN-RED-TRAD",
        "color": "Red",
        "fabric": "Pure Silk",
        "design": "Traditional Zari",
        "salePrice": 2999,
        "stock": 10
      }
    ]
  }
}
```

---

## Step 7: Get All Sarees with Pagination

```bash
curl -X GET "http://localhost:7410/api/admin/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "message": "Products fetched successfully....",
  "products": [...],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Step 8: Search for Sarees

```bash
curl -X GET "http://localhost:7410/api/admin/products?search=banarasi" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200):**
Returns all Banarasi sarees.

---

## Step 9: Update Saree - Add New Color Variant

```bash
curl -X PUT http://localhost:7410/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'variants=[{"sku":"BAN-RED-TRAD","color":"Red","fabric":"Pure Silk","design":"Traditional Zari","salePrice":2999,"purchasePrice":1800,"stock":10},{"sku":"BAN-BLUE-TRAD","color":"Blue","fabric":"Pure Silk","design":"Traditional Zari","salePrice":3199,"purchasePrice":1900,"stock":15},{"sku":"BAN-GREEN-TRAD","color":"Green","fabric":"Pure Silk","design":"Traditional Zari","salePrice":3199,"purchasePrice":1900,"stock":8},{"sku":"BAN-PINK-TRAD","color":"Pink","fabric":"Pure Silk","design":"Traditional Zari","salePrice":3299,"purchasePrice":1950,"stock":12}]'
```

**Expected Response (200):**
Product updated with 4 color variants.

---

## Step 10: Update Variant Stock (Low Stock Replenishment)

```bash
curl -X PUT http://localhost:7410/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'variants=[{"sku":"BAN-RED-TRAD","color":"Red","fabric":"Pure Silk","design":"Traditional Zari","salePrice":2999,"purchasePrice":1800,"stock":50}]'
```

**Expected Response (200):**
Stock updated from 10 to 50.

---

## Step 11: Update Variant Price

```bash
curl -X PUT http://localhost:7410/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'variants=[{"sku":"BAN-BLUE-TRAD","color":"Blue","fabric":"Pure Silk","design":"Traditional Zari","salePrice":3499,"purchasePrice":2000,"stock":15}]'
```

**Expected Response (200):**
Price updated for blue variant.

---

## Step 12: Deactivate Out-of-Stock Variant

```bash
curl -X PUT http://localhost:7410/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F 'variants=[{"sku":"BAN-GREEN-TRAD","color":"Green","fabric":"Pure Silk","design":"Traditional Zari","salePrice":3199,"purchasePrice":1900,"stock":0,"isActive":false}]'
```

**Expected Response (200):**
Green variant deactivated.

---

## Step 13: Compare 2 Saree Products

```bash
curl -X GET "http://localhost:7410/api/admin/products/compare?ids=PRODUCT_ID_1,PRODUCT_ID_2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "PRODUCT_ID_1",
        "name": "Banarasi Silk Saree",
        "category": "Sarees",
        "salePrice": 3000,
        "discount": 10,
        "stock": 50,
        "variants": [
          {
            "sku": "BAN-RED-TRAD",
            "color": "Red",
            "fabric": "Pure Silk",
            "design": "Traditional Zari",
            "stock": 10
          }
        ],
        "variantCount": 3,
        "totalVariantStock": 33,
        "createdAt": "2024-06-11T10:30:00.000Z"
      },
      {
        "_id": "PRODUCT_ID_2",
        "name": "Cotton Saree Collection",
        "category": "Sarees",
        "salePrice": 899,
        "discount": 5,
        "variants": [...],
        "variantCount": 3,
        "totalVariantStock": 50
      }
    ],
    "comparedCount": 2
  }
}
```

---

## Step 14: Compare 3 Different Saree Types

```bash
curl -X GET "http://localhost:7410/api/admin/products/compare?ids=BANARASI_ID,COTTON_ID,DESIGNER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Use Case:** Compare Banarasi (₹3000), Cotton (₹899), and Designer (₹8999) sarees.

---

## Step 15: Public Comparison (User API - No Auth)

```bash
curl -X GET "http://localhost:7410/api/user/products/compare?ids=PRODUCT_ID_1,PRODUCT_ID_2"
```

**Expected Response (200):**
Same comparison data, no authentication required.

---

## Step 16: Test Comparison Validation - Too Few Products

```bash
curl -X GET "http://localhost:7410/api/admin/products/compare?ids=PRODUCT_ID_1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Minimum 2 products required for comparison"
    }
  ]
}
```

---

## Step 17: Test Comparison Validation - Too Many Products

```bash
curl -X GET "http://localhost:7410/api/admin/products/compare?ids=ID1,ID2,ID3,ID4,ID5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Maximum 4 products allowed for comparison"
    }
  ]
}
```

---

## Step 18: Public Saree Listing (User API)

```bash
curl -X GET "http://localhost:7410/api/user/products?page=1&limit=10&search=silk"
```

**Expected Response (200):**
All silk sarees with variants included.

---

## Step 19: Public Saree Details (User API)

```bash
curl -X GET http://localhost:7410/api/user/products/PRODUCT_ID
```

**Expected Response (200):**
Complete saree details with all color/fabric/design variants.

---

## Postman Collection Setup

### Environment Variables

Create these variables in Postman:
- `base_url`: `http://localhost:7410`
- `admin_token`: Your admin token
- `category_id`: Saree category ID
- `party_id`: Supplier party ID
- `banarasi_id`: Banarasi saree product ID
- `cotton_id`: Cotton saree product ID
- `designer_id`: Designer saree product ID

---

## Postman Request Examples

### 1. Create Banarasi Saree with Variants

**Method:** POST  
**URL:** `{{base_url}}/api/admin/products`  
**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Body (form-data):**
```
productDetail: {"name":"Banarasi Silk Saree","hsnCode":"HSN5407","itemCode":"SAREE-001","category":"{{category_id}}"}
saleDetails: {"salePrice":3000,"discount":10}
purchaseDetails: {"purchasePrice":1800,"gstTax":5,"purchaseDesignNo":"BAN-001","purchaseParty":"{{party_id}}"}
stockDetails: {"openingQuantity":50}
variants: [{"sku":"BAN-RED-TRAD","color":"Red","fabric":"Pure Silk","design":"Traditional Zari","salePrice":2999,"purchasePrice":1800,"stock":10}]
image: [select file]
```

---

### 2. Compare Sarees

**Method:** GET  
**URL:** `{{base_url}}/api/admin/products/compare?ids={{banarasi_id}},{{cotton_id}},{{designer_id}}`  
**Headers:**
```
Authorization: Bearer {{admin_token}}
```

---

### 3. Search Sarees

**Method:** GET  
**URL:** `{{base_url}}/api/admin/products?search=banarasi&page=1&limit=10`  
**Headers:**
```
Authorization: Bearer {{admin_token}}
```

---

## Test Scenarios

### Scenario 1: Complete Saree Catalog

**Goal:** Create a diverse saree catalog with multiple variants.

```bash
# 1. Banarasi Collection (3 colors)
curl -X POST ... # Red, Blue, Green variants

# 2. Cotton Collection (3 designs)
curl -X POST ... # Block Print, Embroidered variants

# 3. Designer Collection (2 premium)
curl -X POST ... # Heavy Work, Sequin Work variants

# 4. Kanjivaram Collection (4 colors)
curl -X POST ... # Red, Blue, Green, Golden variants
```

**Result:** 4 saree products with 12 total variants.

---

### Scenario 2: Stock Management

**Goal:** Manage saree inventory efficiently.

```bash
# Check current stock
curl -X GET .../products/PRODUCT_ID

# Replenish low stock variant
curl -X PUT .../products/PRODUCT_ID \
  -F 'variants=[{"sku":"BAN-RED-TRAD",...,"stock":100}]'

# Deactivate out-of-stock
curl -X PUT .../products/PRODUCT_ID \
  -F 'variants=[{"sku":"BAN-BLUE-TRAD",...,"stock":0,"isActive":false}]'
```

---

### Scenario 3: Seasonal Pricing

**Goal:** Update prices for festival season.

```bash
# Increase prices for wedding season
curl -X PUT .../products/DESIGNER_ID \
  -F 'variants=[
    {"sku":"DES-MAROON-HW",...,"salePrice":9999},
    {"sku":"DES-GOLD-SEQ",...,"salePrice":10999}
  ]'

# Discount for off-season
curl -X PUT .../products/COTTON_ID \
  -F 'saleDetails={"discount":25}'
```

---

### Scenario 4: Customer Comparison

**Goal:** Customer wants to compare sarees before buying.

```bash
# Compare 3 sarees in same category
curl -X GET ".../products/compare?ids=ID1,ID2,ID3"

# Customer sees:
# - Banarasi Silk: ₹2999 (3 colors available)
# - Cotton: ₹899 (3 designs available)
# - Designer: ₹8999 (2 premium options)
```

---

### Scenario 5: New Arrival Launch

**Goal:** Launch new saree collection.

```bash
# Create base product
curl -X POST ... # "Festive Collection"

# Add multiple variants
-F 'variants=[
  {"sku":"FEST-RED-Z","color":"Red","fabric":"Silk","design":"Zari Work","salePrice":4999,"stock":15},
  {"sku":"FEST-BLUE-Z","color":"Blue","fabric":"Silk","design":"Zari Work","salePrice":4999,"stock":20},
  {"sku":"FEST-GREEN-Z","color":"Green","fabric":"Silk","design":"Zari Work","salePrice":4999,"stock":18}
]'
```

---

## Verification Checklist

### Product Creation
- [ ] Create saree with single variant
- [ ] Create saree with multiple color variants
- [ ] Create saree with multiple fabric variants
- [ ] Create saree with multiple design variants
- [ ] Create saree with combination variants
- [ ] Image upload works
- [ ] All fields saved correctly

### SKU Management
- [ ] SKU uniqueness enforced
- [ ] Duplicate SKU prevented (same request)
- [ ] Duplicate SKU prevented (different products)
- [ ] SKU format validation works

### Variant Operations
- [ ] Add new variant to existing product
- [ ] Update variant stock
- [ ] Update variant price
- [ ] Deactivate variant
- [ ] Reactivate variant
- [ ] Multiple variant images work

### Product Listing
- [ ] Get all products with pagination
- [ ] Search by product name works
- [ ] Variants included in response
- [ ] Category populated correctly
- [ ] Sorting works (newest first)

### Product Comparison
- [ ] Compare 2 sarees works
- [ ] Compare 3 sarees works
- [ ] Compare 4 sarees works (maximum)
- [ ] Error on 1 product
- [ ] Error on 5+ products
- [ ] Error on invalid IDs
- [ ] Error on non-existent products
- [ ] Variant count shown correctly
- [ ] Total variant stock calculated
- [ ] User API comparison works (no auth)

---

## Common Issues & Solutions

### Issue 1: SKU Already Exists
**Error:**
```json
{
  "success": false,
  "message": "SKUs already exist: BAN-RED-TRAD"
}
```

**Solution:**
- Check existing products for duplicate SKUs
- Use unique SKU format: `FABRIC-COLOR-DESIGN`
- Add unique identifiers if needed: `BAN-RED-TRAD-V2`

---

### Issue 2: Variants Not Showing
**Solution:**
- Ensure variants array is properly formatted JSON
- Check if variants are active (`isActive: true`)
- Verify SKUs are unique

---

### Issue 3: Stock Not Updating
**Solution:**
- Include all required fields when updating
- Must include: sku, color, fabric, design, salePrice, purchasePrice, stock
- Check if product ID is correct

---

### Issue 4: Comparison Returns Empty
**Solution:**
- Verify all product IDs exist
- Check if IDs are valid MongoDB ObjectIds (24 hex characters)
- Ensure products are not deleted

---

### Issue 5: Images Not Uploading
**Solution:**
- Use correct form-data format
- Field name must be 'image'
- Check file size limits
- Verify image file path

---

## Performance Tips

1. **Pagination:** Use limit=10-20 for optimal performance
2. **Search:** Be specific (e.g., "Banarasi silk" vs "silk")
3. **Variants:** Keep 3-8 variants per product for best UX
4. **Images:** Optimize images before upload (< 2MB)
5. **Comparison:** Compare products in same price range

---

## Quick Commands Reference

### Create Saree
```bash
curl -X POST http://localhost:7410/api/admin/products -H "Authorization: Bearer TOKEN" -F 'variants=[{...}]'
```

### Update Stock
```bash
curl -X PUT http://localhost:7410/api/admin/products/ID -H "Authorization: Bearer TOKEN" -F 'variants=[{...}]'
```

### Compare Sarees
```bash
curl -X GET "http://localhost:7410/api/admin/products/compare?ids=ID1,ID2" -H "Authorization: Bearer TOKEN"
```

### Search Sarees
```bash
curl -X GET "http://localhost:7410/api/admin/products?search=term" -H "Authorization: Bearer TOKEN"
```

---

## Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Create with variants | 201 - Product created |
| Duplicate SKU | 400 - Error message |
| Get product | 200 - With all variants |
| Update variant | 200 - Updated successfully |
| Compare 2-4 products | 200 - Comparison data |
| Compare <2 or >4 | 400 - Validation error |
| Search sarees | 200 - Matching results |
| Public API | 200 - No auth needed |

---

## Next Steps

After successful testing:

1. ✅ Test all CRUD operations
2. ✅ Verify SKU uniqueness
3. ✅ Test comparison with different saree types
4. ✅ Verify stock management
5. ✅ Test public APIs
6. ✅ Integrate with frontend
7. ✅ Set up inventory alerts
8. ✅ Configure image CDN

---

**Testing Status:** Ready  
**Last Updated:** June 11, 2026  
**Schema Version:** 2.1 (Saree-specific)  
**Documentation:** SAREE_VARIANT_GUIDE.md
