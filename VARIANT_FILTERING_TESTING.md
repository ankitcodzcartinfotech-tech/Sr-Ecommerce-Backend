# Variant Filtering - Quick Testing Guide

## Setup

**Base URL:** `http://localhost:7410`

**Prerequisites:**
- Server running on port 7410
- Products with variants created (from previous tests)
- Test product IDs ready

---

## Quick Test Commands

### 1. Get All Available Filters

```bash
curl -X GET "http://localhost:7410/api/user/products/filters"
```

**Expected:** List of all colors, fabrics, designs, and price range.

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "colors": ["Blue", "Green", "Red"],
    "fabrics": ["Cotton", "Pure Silk"],
    "designs": ["Traditional Zari", "Block Print"],
    "priceRange": { "min": 899, "max": 9999 }
  }
}
```

---

### 2. Filter by Color

```bash
curl -X GET "http://localhost:7410/api/user/products?color=Red"
```

**Expected:** All products with red color variants.

---

### 3. Filter by Fabric

```bash
curl -X GET "http://localhost:7410/api/user/products?fabric=Silk"
```

**Expected:** Products with silk fabric variants (matches "Pure Silk", "Silk").

---

### 4. Filter by Design

```bash
curl -X GET "http://localhost:7410/api/user/products?design=Traditional"
```

**Expected:** Products with traditional designs (matches "Traditional Zari").

---

### 5. Filter by Price Range

```bash
# Under ₹2000
curl -X GET "http://localhost:7410/api/user/products?maxPrice=2000"

# Above ₹5000
curl -X GET "http://localhost:7410/api/user/products?minPrice=5000"

# Between ₹2000-₹4000
curl -X GET "http://localhost:7410/api/user/products?minPrice=2000&maxPrice=4000"
```

**Expected:** Products with variants in specified price range.

---

### 6. Filter In-Stock Only

```bash
curl -X GET "http://localhost:7410/api/user/products?inStock=true"
```

**Expected:** Only products with stock > 0.

---

### 7. Combined Filters

```bash
curl -X GET "http://localhost:7410/api/user/products?color=Red&fabric=Silk&minPrice=2000&maxPrice=5000&inStock=true"
```

**Expected:** Products matching ALL criteria.

---

### 8. Search + Filter

```bash
curl -X GET "http://localhost:7410/api/user/products?search=Banarasi&color=Red"
```

**Expected:** Banarasi products with red variants.

---

### 9. Category + Filter

```bash
curl -X GET "http://localhost:7410/api/user/products?category=CATEGORY_ID&color=Blue"
```

**Expected:** Blue products in specified category.

---

### 10. Pagination + Filters

```bash
curl -X GET "http://localhost:7410/api/user/products?color=Red&page=1&limit=5"
```

**Expected:** First 5 red products.

---

## Postman Tests

### Test 1: Get Filter Options

**Method:** GET  
**URL:** `http://localhost:7410/api/user/products/filters`  
**Expected:** 200 OK with colors, fabrics, designs, priceRange

---

### Test 2: Color Filter

**Method:** GET  
**URL:** `http://localhost:7410/api/user/products`  
**Params:**
- `color`: `Red`

**Expected:** Products with red variants

---

### Test 3: Multi-Filter

**Method:** GET  
**URL:** `http://localhost:7410/api/user/products`  
**Params:**
- `color`: `Red`
- `fabric`: `Silk`
- `minPrice`: `2000`
- `maxPrice`: `4000`
- `inStock`: `true`

**Expected:** Products matching all filters

---

### Test 4: Case Insensitive

**Method:** GET  
**URL:** `http://localhost:7410/api/user/products`  
**Params:**
- `color`: `red` (lowercase)

**Expected:** Same results as "Red"

---

### Test 5: Partial Match

**Method:** GET  
**URL:** `http://localhost:7410/api/user/products`  
**Params:**
- `fabric`: `Pure` (matches "Pure Silk")

**Expected:** Products with "Pure Silk" fabric

---

## Real-World Test Scenarios

### Scenario 1: Customer Looking for Red Silk Sarees

```bash
# Step 1: See what's available
curl -X GET "http://localhost:7410/api/user/products/filters"

# Step 2: Filter by color and fabric
curl -X GET "http://localhost:7410/api/user/products?color=Red&fabric=Silk"

# Step 3: Add price range
curl -X GET "http://localhost:7410/api/user/products?color=Red&fabric=Silk&maxPrice=3000"

# Step 4: Only in-stock
curl -X GET "http://localhost:7410/api/user/products?color=Red&fabric=Silk&maxPrice=3000&inStock=true"
```

---

### Scenario 2: Budget Shopping

```bash
# Customer has ₹1000-₹2000 budget
curl -X GET "http://localhost:7410/api/user/products?minPrice=1000&maxPrice=2000&inStock=true"
```

---

### Scenario 3: Category Browse with Filters

```bash
# Browse sarees category
curl -X GET "http://localhost:7410/api/user/products?category=SAREE_CATEGORY_ID"

# Add color filter
curl -X GET "http://localhost:7410/api/user/products?category=SAREE_CATEGORY_ID&color=Blue"
```

---

## Verification Checklist

- [ ] Get filters endpoint returns data
- [ ] Color filter works (case-insensitive)
- [ ] Fabric filter works (partial match)
- [ ] Design filter works
- [ ] Price range filter works (min)
- [ ] Price range filter works (max)
- [ ] Price range filter works (min + max)
- [ ] In-stock filter works
- [ ] Category filter works
- [ ] Search + filter combination works
- [ ] Multiple filters work together
- [ ] Pagination works with filters
- [ ] Empty results handled gracefully
- [ ] Filter values returned in response
- [ ] Admin routes work
- [ ] User routes work (no auth needed)

---

## Test Data Setup

If you need test products, create these:

```bash
# Product 1: Red Silk Saree (₹2999)
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer TOKEN" \
  -F 'productDetail={"name":"Red Silk Saree","hsnCode":"HSN001","itemCode":"ITEM001","category":"CAT_ID"}' \
  -F 'saleDetails={"salePrice":3000}' \
  -F 'purchaseDetails={"purchasePrice":1800,"gstTax":5,"purchaseDesignNo":"D001","purchaseParty":"PARTY_ID"}' \
  -F 'variants=[{"sku":"RED-SILK-001","color":"Red","fabric":"Pure Silk","design":"Traditional Zari","salePrice":2999,"purchasePrice":1800,"stock":10}]'

# Product 2: Blue Cotton Saree (₹899)
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer TOKEN" \
  -F 'productDetail={"name":"Blue Cotton Saree","hsnCode":"HSN002","itemCode":"ITEM002","category":"CAT_ID"}' \
  -F 'saleDetails={"salePrice":899}' \
  -F 'purchaseDetails={"purchasePrice":450,"gstTax":5,"purchaseDesignNo":"D002","purchaseParty":"PARTY_ID"}' \
  -F 'variants=[{"sku":"BLUE-COT-001","color":"Blue","fabric":"Cotton","design":"Block Print","salePrice":899,"purchasePrice":450,"stock":20}]'

# Product 3: Green Silk Saree (₹4999, Out of Stock)
curl -X POST http://localhost:7410/api/admin/products \
  -H "Authorization: Bearer TOKEN" \
  -F 'productDetail={"name":"Green Silk Saree","hsnCode":"HSN003","itemCode":"ITEM003","category":"CAT_ID"}' \
  -F 'saleDetails={"salePrice":4999}' \
  -F 'purchaseDetails={"purchasePrice":3000,"gstTax":5,"purchaseDesignNo":"D003","purchaseParty":"PARTY_ID"}' \
  -F 'variants=[{"sku":"GREEN-SILK-001","color":"Green","fabric":"Pure Silk","design":"Embroidered","salePrice":4999,"purchasePrice":3000,"stock":0}]'
```

---

## Expected Behavior

### Single Filter
- Returns products with at least one variant matching the filter

### Multiple Filters
- Returns products with variants matching ALL filters (AND logic)

### Case Sensitivity
- All text filters are case-insensitive

### Partial Matching
- Text filters use regex for partial matches
- "Silk" matches "Pure Silk", "Silk Blend", etc.

### Empty Results
- Returns empty array with pagination info
- No error message

---

## Troubleshooting

### No Results Returned

**Issue:** Filter returns empty array

**Solutions:**
1. Check if filter value exists: `GET /api/user/products/filters`
2. Try partial match: Use "Silk" instead of "Pure Silk"
3. Check case: Filters are case-insensitive but value must exist
4. Remove filters one by one to identify which is causing issue

---

### Filters Not Working

**Issue:** Filter parameter ignored

**Solutions:**
1. Check URL encoding: Use `%20` for spaces
2. Verify parameter name: `color` not `Color`
3. Check server logs for errors
4. Test filter options endpoint first

---

### Wrong Price Range

**Issue:** Price filter returns unexpected results

**Solutions:**
1. Verify variant prices in database
2. Check if using variant.salePrice (not base price)
3. Test with wider range first
4. Ensure minPrice < maxPrice

---

## Performance Check

### Test with Large Dataset

```bash
# Get all products (no filter)
time curl -X GET "http://localhost:7410/api/user/products?limit=100"

# Get with filters
time curl -X GET "http://localhost:7410/api/user/products?color=Red&fabric=Silk&limit=100"
```

**Expected:** Both should complete in < 1 second

---

## Integration Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:7410/api/user/products"

echo "Test 1: Get filters"
curl -s "${BASE_URL}/filters" | grep -q "colors" && echo "✅ PASS" || echo "❌ FAIL"

echo "Test 2: Color filter"
curl -s "${BASE_URL}?color=Red" | grep -q "products" && echo "✅ PASS" || echo "❌ FAIL"

echo "Test 3: Price filter"
curl -s "${BASE_URL}?minPrice=1000&maxPrice=5000" | grep -q "products" && echo "✅ PASS" || echo "❌ FAIL"

echo "Test 4: Stock filter"
curl -s "${BASE_URL}?inStock=true" | grep -q "products" && echo "✅ PASS" || echo "❌ FAIL"

echo "Test 5: Combined filters"
curl -s "${BASE_URL}?color=Red&fabric=Silk&inStock=true" | grep -q "products" && echo "✅ PASS" || echo "❌ FAIL"

echo "All tests completed!"
```

---

**Status:** Ready for Testing ✅  
**Last Updated:** June 11, 2026
