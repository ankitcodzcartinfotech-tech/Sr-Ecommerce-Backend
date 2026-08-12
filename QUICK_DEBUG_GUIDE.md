# Quick Debug Guide - Fix Products Not Showing

## 🚀 5-Minute Debug Process

### Step 1: Is Server Running? (30 seconds)

```bash
# Check if server is responding
curl http://localhost:7410/api/user/products/debug/test
```

**Expected:** Any response  
**If fails:** Server not running → Start it: `node index.js`

---

### Step 2: Do Products Exist? (1 minute)

```bash
# Connect to MongoDB (replace connection string)
mongosh "your_connection_string"

# Or if local:
mongosh

# Count products
db.products.countDocuments()
```

**Expected:** Number > 0  
**If 0:** No products → Create products via admin panel first

---

### Step 3: Does API Return Products? (1 minute)

```bash
curl http://localhost:7410/api/user/products
```

**Expected Response:**
```json
{
  "message": "Products fetched successfully....",
  "products": [
    {
      "_id": "...",
      "productDetail": {
        "name": "Some Product"
      }
    }
  ],
  "pagination": {
    "total": 5
  }
}
```

**If empty array:** Products exist but API has issues  
**If error:** Check server logs

---

### Step 4: Check Frontend API Call (2 minutes)

1. **Open your frontend in browser**
2. **Open DevTools (F12)**
3. **Go to Network tab**
4. **Reload the product page**
5. **Look for API calls**

**What to check:**
- ✅ Is call being made to `/api/user/products`?
- ✅ Is status code 200?
- ✅ Does response have products?
- ❌ Status 404? Wrong URL in frontend
- ❌ Status 500? Server error
- ❌ No call at all? Frontend code issue

---

## 🎯 Based on Results, Do This:

### Scenario A: Step 3 Returns Products ✅
**Diagnosis:** Backend is fine, frontend is broken

**Fix:**
1. Check frontend API base URL
2. Should be: `http://localhost:7410/api`
3. Endpoint should be: `/user/products`
4. Full URL: `http://localhost:7410/api/user/products`

---

### Scenario B: Step 3 Returns Empty Array
**Diagnosis:** Backend working but no data or filters too strict

**Fix:**
```bash
# Check if products have required fields
mongosh
db.products.findOne()

# Should have:
# - productDetail.name
# - saleDetails.salePrice
# - productDetail.category (valid ID)
```

---

### Scenario C: Step 3 Returns Error
**Diagnosis:** Backend issue

**Check:**
1. Server logs for error details
2. MongoDB connection
3. Product schema validation errors

---

### Scenario D: Step 2 Shows 0 Products
**Diagnosis:** No products in database

**Fix:**
1. Use admin panel to create products
2. Or import sample products
3. Verify products are being saved

---

## 🔧 Quick Fixes

### Fix 1: Add Debug Endpoint

Add to `routes/User/product.routes.js`:
```javascript
router.get('/test', (req, res) => {
  res.json({ success: true, message: "Products API is reachable" });
});
```

Test:
```bash
curl http://localhost:7410/api/user/products/test
```

---

### Fix 2: Simplify getProducts for Testing

In `controller/product.controller.js`, temporarily replace `getProducts`:
```javascript
exports.getProducts = async (req, res) => {
    try {
        const products = await PRODUCT.find().limit(5);
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
```

---

### Fix 3: Check Category Population

```bash
# In MongoDB
mongosh
db.categories.countDocuments()

# If 0, create a category:
db.categories.insertOne({
  name: "Test Category",
  hsnCode: "TEST001"
})

# Copy the _id
# Update a product to use this category
db.products.updateOne(
  {},
  { $set: { "productDetail.category": ObjectId("CATEGORY_ID") } }
)
```

---

## 📊 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Wrong API URL | 404 in Network tab | Fix frontend base URL |
| No products | Empty array | Create products in admin |
| Broken refs | null categories | Fix category IDs |
| CORS error | Red in console | Check server CORS (already set) |
| Image 404 | Broken images | Fix image paths |
| Server not running | Connection refused | Start server |

---

## 🎯 Decision Tree

```
Can you access http://localhost:7410 ?
│
├─ NO → Server not running → Start: node index.js
│
└─ YES → Does curl return products?
    │
    ├─ NO → MongoDB has products?
    │   │
    │   ├─ NO → Create products first
    │   │
    │   └─ YES → Check server logs for errors
    │
    └─ YES → Frontend issue!
        │
        Check:
        1. API URL in frontend config
        2. Network tab in browser
        3. Console for errors
```

---

## 🚨 Emergency Commands

### Restart Everything:
```bash
# Stop server (Ctrl+C)
# Restart MongoDB (if local)
# Start server again
node index.js
```

### Check All Services:
```bash
# Server
curl http://localhost:7410/api/user/products

# MongoDB
mongosh
db.products.countDocuments()
exit

# Frontend (in browser)
# Check console for errors
```

### Reset and Test:
```bash
# Simple test product
mongosh
db.products.insertOne({
  productDetail: {
    name: "Test Saree",
    hsnCode: "TEST001",
    itemCode: "TEST-001"
  },
  saleDetails: {
    salePrice: 999
  },
  purchaseDetails: {
    purchasePrice: 500,
    gstTax: 5,
    purchaseDesignNo: "D001"
  },
  stockDetails: {
    openingQuantity: 10
  },
  variants: []
})

# Now test API again
curl http://localhost:7410/api/user/products
```

---

## ✅ Success Checklist

- [ ] Server responds to curl
- [ ] MongoDB has products
- [ ] API returns product array
- [ ] Products have name and price
- [ ] Frontend makes correct API call
- [ ] Frontend shows products

**When all checked:** Products should be showing!

---

## 📞 Still Not Working?

### Collect This Info:

1. **Server status:**
   ```bash
   curl http://localhost:7410/api/user/products
   ```
   Copy full response

2. **MongoDB status:**
   ```bash
   mongosh
   db.products.countDocuments()
   db.products.findOne()
   ```
   Copy result

3. **Browser Network tab:**
   - Screenshot of API call
   - Status code
   - Response body

4. **Browser Console:**
   - Any errors?
   - Screenshot

**With this info, exact issue can be identified!**

---

**Last Updated:** June 11, 2026  
**Estimated Debug Time:** 5-10 minutes
