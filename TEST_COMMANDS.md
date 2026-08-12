# Test Commands - Copy & Paste Ready

## 🚀 Run These Commands in Order

### Test 1: Is Server Running?

```bash
curl http://localhost:7410/api/user/products
```

**Expected:** JSON response with products array  
**If fails:** Server not running

---

### Test 2: Check MongoDB Products

```bash
mongosh
```

Then in MongoDB shell:
```javascript
// Show databases
show dbs

// Use your database (replace with actual name)
use keshrag

// Count products
db.products.countDocuments()

// Show one product
db.products.findOne()

// Exit
exit
```

**Expected:** Count > 0 and product data  
**If 0:** No products in database

---

### Test 3: Test with Detailed Response

```bash
curl -v http://localhost:7410/api/user/products
```

**Check for:**
- Status code: `HTTP/1.1 200 OK`
- Content-Type: `application/json`
- Response body with products

---

### Test 4: Test Single Product

```bash
# Replace PRODUCT_ID with actual ID from Test 2
curl http://localhost:7410/api/user/products/PRODUCT_ID
```

**Expected:** Single product details

---

### Test 5: Test Filter Options

```bash
curl http://localhost:7410/api/user/products/filters
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "colors": ["Red", "Blue"],
    "fabrics": ["Silk", "Cotton"],
    "designs": [...],
    "priceRange": { "min": 899, "max": 9999 }
  }
}
```

---

### Test 6: Test with Pagination

```bash
curl "http://localhost:7410/api/user/products?page=1&limit=5"
```

**Expected:** 5 products with pagination info

---

### Test 7: Test with Search

```bash
curl "http://localhost:7410/api/user/products?search=saree"
```

**Expected:** Products matching "saree" in name

---

### Test 8: Test Product Comparison

```bash
# Replace with 2 actual product IDs
curl "http://localhost:7410/api/user/products/compare?ids=ID1,ID2"
```

**Expected:** Comparison data for 2 products

---

## 📊 Interpret Results

### Scenario A: All Tests Pass ✅
**Diagnosis:** Backend is perfect  
**Action:** Check frontend API configuration

### Scenario B: Test 1 Fails ❌
**Diagnosis:** Server not running  
**Action:**
```bash
cd c:\Codzcart\Keshrag-backend-main
node index.js
```

### Scenario C: Test 1 Passes, But Empty Array
**Diagnosis:** No products or filter too strict  
**Action:** Check Test 2 for products in DB

### Scenario D: Test 2 Shows 0 Products
**Diagnosis:** Database empty  
**Action:** Create products via admin panel

### Scenario E: Test 1 Returns Error
**Diagnosis:** Server error  
**Action:** Check server console logs

---

## 🔧 Quick Fixes

### Fix 1: Create Test Product

```bash
mongosh
use keshrag
```

```javascript
db.products.insertOne({
  productDetail: {
    name: "Test Banarasi Saree",
    hsnCode: "HSN5407",
    itemCode: "TEST-001",
    description: "Test product for debugging",
    checkNegativeStock: 1,
    image: ""
  },
  saleDetails: {
    salePrice: 2999,
    discount: 10,
    measuringUnit: "piece"
  },
  purchaseDetails: {
    wholeshaleAllow: false,
    purchasePrice: 1800,
    gstTax: 5,
    purchaseDesignNo: "TEST-D001"
  },
  stockDetails: {
    openingQuantity: 50,
    atPrice: 0,
    atOfDate: 0,
    minStockToMaintain: 5,
    location: ""
  },
  variants: []
})
```

Now test again:
```bash
curl http://localhost:7410/api/user/products
```

---

### Fix 2: Check Server Logs

In terminal where server is running, you should see:
```
DB is connected...
server is running on port 7410...
```

If you see errors, note them and check BACKEND_AUDIT_REPORT.md

---

### Fix 3: Test from Browser

Open browser and go to:
```
http://localhost:7410/api/user/products
```

You should see JSON response in browser.

---

## 🌐 Frontend Test Commands

### Test in Browser Console (F12 → Console)

```javascript
// Test API call
fetch('http://localhost:7410/api/user/products')
  .then(res => res.json())
  .then(data => console.log('Products:', data))
  .catch(err => console.error('Error:', err));
```

**Expected:** Products data logged  
**If error:** Note the error message

---

### Check Frontend API Configuration

In your frontend code, find where API calls are made.

**Should look like:**
```javascript
const API_BASE_URL = "http://localhost:7410/api";

// Then calls:
fetch(`${API_BASE_URL}/user/products`)
```

**Common mistakes:**
```javascript
❌ const API_BASE_URL = "http://localhost:7410";
❌ fetch(`${API_BASE_URL}/products`) // Missing /user
❌ fetch('/api/user/products') // Missing base URL
```

---

## 📋 Checklist Format Results

Copy this and fill in your results:

```
Test Results:
[ ] Test 1: Server responds - Status: ___
[ ] Test 2: MongoDB has ___ products
[ ] Test 3: HTTP status code: ___
[ ] Test 4: Single product works: ___
[ ] Test 5: Filter options work: ___
[ ] Test 6: Pagination works: ___
[ ] Test 7: Search works: ___
[ ] Test 8: Comparison works: ___

Frontend Tests:
[ ] Browser can access: http://localhost:7410/api/user/products
[ ] Frontend console shows API call to: ___
[ ] Network tab shows status: ___
[ ] Response body contains products: ___

Conclusion:
Backend Working: YES / NO
Frontend Issue: YES / NO / UNKNOWN
```

---

## 🎯 Decision Matrix

```
Did Test 1 return products?
│
├─ YES → Backend is working ✅
│   │
│   └─ Check frontend:
│       - API URL configuration
│       - Network tab in browser
│       - Console errors
│
└─ NO → Did Test 2 show products in DB?
    │
    ├─ YES → API issue
    │   │
    │   └─ Check:
    │       - Server logs
    │       - Product schema validation
    │       - References (category, party)
    │
    └─ NO → No products
        │
        └─ Create products via admin panel
```

---

## 🚨 Emergency Reset

If everything is broken:

```bash
# 1. Stop server (Ctrl+C)

# 2. Check .env file has:
# MONGO_DB=your_mongodb_connection_string
# PORT=7410
# JWT_SECRET=your_secret_key

# 3. Restart server
node index.js

# 4. Test again
curl http://localhost:7410/api/user/products
```

---

## 📞 Report Template

If still not working, collect this info:

```
Environment:
- OS: Windows
- Node Version: node --version
- MongoDB: local / Atlas

Test Results:
- curl test: [paste output]
- MongoDB count: [paste output]
- Browser network: [screenshot]
- Console errors: [paste errors]

Server Logs:
[paste last 20 lines from server console]
```

---

**Last Updated:** June 11, 2026  
**Purpose:** Quick debugging commands  
**Estimated Time:** 5-10 minutes to run all tests
