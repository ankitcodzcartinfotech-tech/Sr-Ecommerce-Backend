# Banner Management API Testing Guide

## Quick Start Testing

### Prerequisites
1. Server running on `http://localhost:7410`
2. Admin token (get from admin login)
3. Test image file ready for upload

---

## Step-by-Step Testing

### Step 1: Admin Login
First, get an admin token:

```bash
curl -X POST http://localhost:7410/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin_password"
  }'
```

**Response:**
```json
{
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save this token for subsequent requests.

---

### Step 2: Create Banner (Admin)

```bash
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Summer Sale 2024" \
  -F "subtitle=Get up to 50% off on all products" \
  -F "image=@./path/to/banner.jpg" \
  -F "buttonText=Shop Now" \
  -F "buttonLink=/products" \
  -F "position=1" \
  -F "isActive=true" \
  -F "startDate=2024-06-01T00:00:00.000Z" \
  -F "endDate=2024-08-31T23:59:59.999Z"
```

**Note:** When sending boolean values via form-data, use string "true" or "false"

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "title": "Summer Sale 2024",
    "subtitle": "Get up to 50% off on all products",
    "image": "uploads/banner-1234567890.jpg",
    "buttonText": "Shop Now",
    "buttonLink": "/products",
    "position": 1,
    "isActive": true,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T23:59:59.999Z",
    "createdAt": "2024-05-20T10:30:00.000Z",
    "updatedAt": "2024-05-20T10:30:00.000Z"
  }
}
```

---

### Step 3: Get All Banners (Admin)

**Without filters:**
```bash
curl -X GET http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**With pagination:**
```bash
curl -X GET "http://localhost:7410/api/admin/banners?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**With search:**
```bash
curl -X GET "http://localhost:7410/api/admin/banners?search=sale" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Banners fetched successfully",
  "data": [
    {
      "_id": "60d5f484f8d2e123456789ab",
      "title": "Summer Sale 2024",
      ...
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### Step 4: Get Banner by ID (Admin)

```bash
curl -X GET http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Banner fetched successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "title": "Summer Sale 2024",
    ...
  }
}
```

---

### Step 5: Update Banner (Admin)

**Update with new image:**
```bash
curl -X PUT http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Updated Summer Sale" \
  -F "subtitle=Now 60% off!" \
  -F "image=@./path/to/new-banner.jpg" \
  -F "position=2"
```

**Update without image:**
```bash
curl -X PUT http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Updated Summer Sale" \
  -F "subtitle=Now 60% off!" \
  -F "position=2"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "title": "Updated Summer Sale",
    "subtitle": "Now 60% off!",
    ...
  }
}
```

---

### Step 6: Update Banner Status (Admin)

**Deactivate banner:**
```bash
curl -X PATCH http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

**Activate banner:**
```bash
curl -X PATCH http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Banner deactivated successfully",
  "data": {
    "_id": "60d5f484f8d2e123456789ab",
    "isActive": false,
    ...
  }
}
```

---

### Step 7: Get Active Banners (User/Public)

**No authentication required:**
```bash
curl -X GET http://localhost:7410/api/user/banners
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Active banners fetched successfully",
  "data": [
    {
      "_id": "60d5f484f8d2e123456789ab",
      "title": "Summer Sale 2024",
      "subtitle": "Get up to 50% off on all products",
      "image": "uploads/banner-1234567890.jpg",
      "buttonText": "Shop Now",
      "buttonLink": "/products",
      "position": 1,
      "isActive": true,
      ...
    }
  ]
}
```

---

### Step 8: Delete Banner (Admin)

```bash
curl -X DELETE http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

## Using Postman

### Setup

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:7410`
   - `admin_token`: (paste your admin token)

2. **Import Collection:**

Create a new collection with these requests:

### 1. Create Banner
- **Method:** POST
- **URL:** `{{base_url}}/api/admin/banners`
- **Headers:**
  - `Authorization`: `Bearer {{admin_token}}`
- **Body (form-data):**
  - `title`: Summer Sale 2024
  - `subtitle`: Up to 50% off
  - `image`: [select file]
  - `buttonText`: Shop Now
  - `buttonLink`: /products
  - `position`: 1
  - `isActive`: true

### 2. Get All Banners
- **Method:** GET
- **URL:** `{{base_url}}/api/admin/banners?page=1&limit=10`
- **Headers:**
  - `Authorization`: `Bearer {{admin_token}}`

### 3. Get Banner by ID
- **Method:** GET
- **URL:** `{{base_url}}/api/admin/banners/:id`
- **Headers:**
  - `Authorization`: `Bearer {{admin_token}}`

### 4. Update Banner
- **Method:** PUT
- **URL:** `{{base_url}}/api/admin/banners/:id`
- **Headers:**
  - `Authorization`: `Bearer {{admin_token}}`
- **Body (form-data):**
  - Add fields you want to update

### 5. Update Status
- **Method:** PATCH
- **URL:** `{{base_url}}/api/admin/banners/:id/status`
- **Headers:**
  - `Authorization`: `Bearer {{admin_token}}`
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "isActive": false
  }
  ```

### 6. Delete Banner
- **Method:** DELETE
- **URL:** `{{base_url}}/api/admin/banners/:id`
- **Headers:**
  - `Authorization`: `Bearer {{admin_token}}`

### 7. Get Active Banners (Public)
- **Method:** GET
- **URL:** `{{base_url}}/api/user/banners`
- **Headers:** None required

---

## Test Scenarios

### Scenario 1: Create Multiple Banners with Different Positions

```bash
# Banner 1 - Position 1
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Banner 1" \
  -F "image=@banner1.jpg" \
  -F "position=1"

# Banner 2 - Position 2
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Banner 2" \
  -F "image=@banner2.jpg" \
  -F "position=2"

# Banner 3 - Position 0 (should appear first)
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Banner 3" \
  -F "image=@banner3.jpg" \
  -F "position=0"

# Get active banners - verify order
curl -X GET http://localhost:7410/api/user/banners
```

Expected order: Banner 3, Banner 1, Banner 2

---

### Scenario 2: Test Date Range Filtering

```bash
# Create banner with future dates (should not appear)
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Future Banner" \
  -F "image=@banner.jpg" \
  -F "startDate=2025-01-01T00:00:00.000Z" \
  -F "endDate=2025-12-31T23:59:59.999Z"

# Get active banners - should not include future banner
curl -X GET http://localhost:7410/api/user/banners

# Create banner with past dates (should not appear)
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Past Banner" \
  -F "image=@banner.jpg" \
  -F "startDate=2023-01-01T00:00:00.000Z" \
  -F "endDate=2023-12-31T23:59:59.999Z"

# Get active banners - should not include past banner
curl -X GET http://localhost:7410/api/user/banners

# Create banner with current dates (should appear)
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Current Banner" \
  -F "image=@banner.jpg" \
  -F "startDate=2024-01-01T00:00:00.000Z" \
  -F "endDate=2026-12-31T23:59:59.999Z"

# Get active banners - should include current banner
curl -X GET http://localhost:7410/api/user/banners
```

---

### Scenario 3: Test Search Functionality

```bash
# Create banners with different titles
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Summer Sale 2024" \
  -F "image=@banner1.jpg"

curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Winter Collection" \
  -F "image=@banner2.jpg"

curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Spring Sale" \
  -F "image=@banner3.jpg"

# Search for "sale" - should return Summer Sale and Spring Sale
curl -X GET "http://localhost:7410/api/admin/banners?search=sale" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Search for "winter" - should return Winter Collection
curl -X GET "http://localhost:7410/api/admin/banners?search=winter" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Scenario 4: Test Pagination

```bash
# Create 15 banners
for i in {1..15}; do
  curl -X POST http://localhost:7410/api/admin/banners \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -F "title=Banner $i" \
    -F "image=@banner.jpg" \
    -F "position=$i"
done

# Get page 1 (5 items)
curl -X GET "http://localhost:7410/api/admin/banners?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get page 2 (5 items)
curl -X GET "http://localhost:7410/api/admin/banners?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get page 3 (5 items)
curl -X GET "http://localhost:7410/api/admin/banners?page=3&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Error Testing

### Test 1: Create Banner Without Title
```bash
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@banner.jpg"
```
**Expected:** 400 - "Title is required"

### Test 2: Create Banner Without Image
```bash
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Test Banner"
```
**Expected:** 400 - "Image is required"

### Test 3: Get Non-Existent Banner
```bash
curl -X GET http://localhost:7410/api/admin/banners/000000000000000000000000 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected:** 404 - "Banner not found"

### Test 4: Update Without Auth Token
```bash
curl -X PUT http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab \
  -F "title=Updated Banner"
```
**Expected:** 401 - Unauthorized

### Test 5: Invalid Page Number
```bash
curl -X GET "http://localhost:7410/api/admin/banners?page=0" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
**Expected:** 400 - "Page number must be greater than 0"

---

## Verification Checklist

- [ ] Admin can create banner with all fields
- [ ] Admin can create banner with only required fields
- [ ] Admin can view all banners with pagination
- [ ] Admin can search banners by title
- [ ] Admin can get single banner by ID
- [ ] Admin can update banner with new image
- [ ] Admin can update banner without changing image
- [ ] Admin can toggle banner status
- [ ] Admin can delete banner
- [ ] Users can view only active banners
- [ ] Date filtering works correctly
- [ ] Position ordering works correctly
- [ ] Error handling works for all edge cases
- [ ] Image upload works correctly
- [ ] Pagination works correctly

---

## Common Issues & Solutions

### Issue: "Image is required" even when uploading
**Solution:** Ensure field name is `image` and check `helper/image.js` configuration

### Issue: Banners not appearing in user API
**Solution:** 
1. Check if banner is active (`isActive: true`)
2. Verify date range includes current date
3. Ensure banner was created successfully

### Issue: "Unauthorized" error
**Solution:** 
1. Verify admin token is valid
2. Check Authorization header format: `Bearer TOKEN`
3. Ensure admin is logged in

### Issue: "Cast to Boolean failed" error
**Solution:** When sending form-data, boolean values must be sent as strings:
- Use `"true"` or `"false"` (as strings)
- NOT `true` or `false` (as boolean)
- Example: `-F "isActive=true"` (correct)

### Issue: Search not working
**Solution:** Search is case-insensitive, try partial matches

---

## Performance Tips

1. **Image Size:** Keep banner images under 2MB for faster loading
2. **Pagination:** Use appropriate limit values (10-20 recommended)
3. **Indexes:** MongoDB indexes are automatically created on position and dates
4. **Caching:** Consider caching active banners on client side

---

## Next Steps

After successful testing:

1. ✅ Integrate with frontend
2. ✅ Set up image CDN for production
3. ✅ Add banner analytics tracking
4. ✅ Implement banner click tracking
5. ✅ Add banner preview feature
6. ✅ Set up automated tests

---

For complete API documentation, see **BANNER_API_DOCUMENTATION.md**
