# Banner API Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: CastError - Cast to Boolean failed

**Error Message:**
```
CastError: Cast to Boolean failed for value "optional" (type string) at path "isActive"
```

**Cause:**
When sending form-data (multipart/form-data), all values are sent as strings. Mongoose cannot automatically convert arbitrary strings to boolean.

**Solution:**
When sending boolean values via form-data, use the string "true" or "false":

```bash
# ✅ CORRECT
curl -F "isActive=true"   # String "true"
curl -F "isActive=false"  # String "false"

# ❌ WRONG
curl -F "isActive=optional"  # Invalid string
```

**For Postman:**
- In the form-data body, type `true` or `false` as text
- The controller will automatically convert "true" → true and "false" → false

---

### Issue 2: Image Not Uploading

**Error Message:**
```json
{
  "success": false,
  "message": "Image is required"
}
```

**Cause:**
- Image field missing in request
- Wrong field name used
- File not selected properly

**Solution:**

**cURL:**
```bash
# ✅ CORRECT - Use @ symbol before file path
curl -F "image=@/path/to/image.jpg"

# ❌ WRONG - Missing @ symbol
curl -F "image=/path/to/image.jpg"
```

**Postman:**
1. Select "form-data" in Body tab
2. For the "image" key, change type to "File" (not "Text")
3. Click "Select Files" and choose your image
4. Ensure key name is exactly "image"

---

### Issue 3: Position Not Working

**Error:**
Banners appear in wrong order

**Cause:**
Position is sent as string but not converted to number

**Solution:**
The controller now automatically converts position to number. Just send it as a value:

```bash
# Both work correctly now
curl -F "position=1"
curl -F "position=5"
```

**Ordering Logic:**
- Lower position numbers appear first
- Position 0 appears before position 1
- If two banners have same position, sorted by creation date

---

### Issue 4: Date Filtering Not Working

**Error:**
Banner not appearing even though it's active

**Cause:**
- Date format is incorrect
- Current date is outside the banner's date range

**Solution:**

**Check Date Format:**
Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

```bash
# ✅ CORRECT
-F "startDate=2024-06-01T00:00:00.000Z"
-F "endDate=2024-12-31T23:59:59.999Z"

# ❌ WRONG
-F "startDate=2024-06-01"
-F "startDate=06/01/2024"
```

**Date Logic:**
- If startDate is set: current date must be >= startDate
- If endDate is set: current date must be <= endDate
- If both are set: current date must be between them
- If neither is set: banner always shows (when active)

**Check Current Date:**
Today is June 11, 2026. Ensure your banner dates include this date.

---

### Issue 5: Unauthorized Error

**Error Message:**
```json
{
  "success": false,
  "message": "Unauthorized" 
}
```

**Cause:**
- Missing or invalid admin token
- Token expired
- Wrong authorization header format

**Solution:**

**Get Admin Token:**
```bash
curl -X POST http://localhost:7410/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**Use Token Correctly:**
```bash
# ✅ CORRECT
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ❌ WRONG - Missing "Bearer "
-H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ❌ WRONG - Wrong header name
-H "Token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Issue 6: Banner Not Found (404)

**Error Message:**
```json
{
  "success": false,
  "message": "Banner not found"
}
```

**Cause:**
- Banner ID doesn't exist
- Banner was deleted
- Invalid ObjectId format

**Solution:**

**Verify Banner ID:**
```bash
# First, get all banners to see valid IDs
curl -X GET http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_TOKEN"

# Use a valid ID from the response
curl -X GET http://localhost:7410/api/admin/banners/60d5f484f8d2e123456789ab \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Valid ObjectId Format:**
- Must be 24 characters
- Hexadecimal (0-9, a-f)
- Example: `60d5f484f8d2e123456789ab`

---

### Issue 7: Title Cannot Be Empty

**Error Message:**
```json
{
  "success": false,
  "message": "Title cannot be empty"
}
```

**Cause:**
- Title is empty string or only whitespace
- Title is missing when updating

**Solution:**

```bash
# ✅ CORRECT
curl -F "title=Summer Sale 2024"

# ❌ WRONG - Empty string
curl -F "title="

# ❌ WRONG - Only spaces
curl -F "title=   "
```

**Note:** Title is required for creation but optional for updates. However, if you include title in an update, it cannot be empty.

---

### Issue 8: Banners Not Appearing in User API

**Error:**
User API returns empty array even though banners exist

**Cause:**
Banners are filtered by:
1. `isActive: true`
2. Current date within startDate/endDate range

**Solution:**

**Check Banner Status:**
```bash
# Get all banners as admin to see their status
curl -X GET http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Fix Inactive Banner:**
```bash
# Activate a banner
curl -X PATCH http://localhost:7410/api/admin/banners/BANNER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

**Check Date Range:**
- Remove startDate/endDate to show banner always:
```bash
curl -X PUT http://localhost:7410/api/admin/banners/BANNER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "startDate=" \
  -F "endDate="
```

---

### Issue 9: Search Returns No Results

**Error:**
Search query returns empty results even though banners exist

**Cause:**
- Search is case-insensitive but looks for partial matches
- Typo in search query

**Solution:**

```bash
# Search is case-insensitive and uses regex
# Searches anywhere in the title

# If banner title is "Summer Sale 2024"
curl -X GET "http://localhost:7410/api/admin/banners?search=summer" # ✅ Works
curl -X GET "http://localhost:7410/api/admin/banners?search=SUMMER" # ✅ Works
curl -X GET "http://localhost:7410/api/admin/banners?search=sale"   # ✅ Works
curl -X GET "http://localhost:7410/api/admin/banners?search=2024"   # ✅ Works
curl -X GET "http://localhost:7410/api/admin/banners?search=winter" # ❌ No match
```

---

### Issue 10: Pagination Not Working

**Error:**
Getting same results for different pages

**Cause:**
- Invalid page or limit values
- Not enough banners to paginate

**Solution:**

**Valid Pagination:**
```bash
# Page must be >= 1
curl -X GET "http://localhost:7410/api/admin/banners?page=1&limit=10" # ✅
curl -X GET "http://localhost:7410/api/admin/banners?page=0&limit=10" # ❌ Error

# Limit must be between 1 and 100
curl -X GET "http://localhost:7410/api/admin/banners?page=1&limit=10"  # ✅
curl -X GET "http://localhost:7410/api/admin/banners?page=1&limit=150" # ❌ Error
```

**Check Total Count:**
```bash
# Response includes pagination info
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,        // Total banners
    "page": 1,          // Current page
    "limit": 10,        // Items per page
    "totalPages": 3     // Total pages available
  }
}
```

---

## Debugging Steps

### Step 1: Check Server Logs
Look at your terminal where the server is running for detailed error messages.

### Step 2: Verify Request Format
```bash
# Use -v flag with curl to see full request/response
curl -v -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer TOKEN" \
  -F "title=Test" \
  -F "image=@banner.jpg"
```

### Step 3: Test in Postman
- Easier to debug than command line
- Can see full request/response
- Can save requests for reuse

### Step 4: Check Database
```javascript
// In MongoDB shell or Compass
db.banners.find({})  // See all banners
db.banners.findOne({ _id: ObjectId("YOUR_ID") })  // Check specific banner
```

---

## Quick Fixes

### Reset All Banners
```bash
# Delete all banners (be careful!)
# You'll need to do this individually via API or directly in database
```

### Create Test Banner
```bash
# Minimal working example
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Test Banner" \
  -F "image=@test-image.jpg"
```

### Check If Server Is Running
```bash
# Test server health
curl http://localhost:7410/api/user/banners
# Should return active banners or empty array (not connection error)
```

---

## Form-Data vs JSON

### When to Use Form-Data
- Creating banner (requires image upload)
- Updating banner (with or without new image)

### When to Use JSON
- Updating banner status (PATCH /status)
- No file upload needed

### Examples

**Form-Data (for file upload):**
```bash
curl -X POST http://localhost:7410/api/admin/banners \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test" \
  -F "image=@banner.jpg"
```

**JSON (no file upload):**
```bash
curl -X PATCH http://localhost:7410/api/admin/banners/ID/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

---

## Postman Tips

### Setting Up Environment
1. Create environment variable `base_url`: `http://localhost:7410`
2. Create environment variable `admin_token`: Your admin token
3. Use `{{base_url}}` and `{{admin_token}}` in requests

### Sending Boolean in Form-Data
1. Select "form-data" in Body
2. Key: `isActive`
3. Value: Type `true` or `false` as TEXT (not file)
4. Controller will convert string to boolean

### Sending Files
1. Select "form-data" in Body
2. For "image" key, change dropdown from "Text" to "File"
3. Click "Select Files"
4. Choose your image

---

## Contact & Support

If you continue to experience issues:

1. Check server logs for detailed error messages
2. Verify all prerequisites (MongoDB connection, server running)
3. Review the BANNER_API_DOCUMENTATION.md for complete reference
4. Check BANNER_TESTING_GUIDE.md for step-by-step examples

---

## Summary of Data Type Conversions

The controller automatically handles these conversions:

| Field | Input (Form-Data) | Converted To | Example |
|-------|-------------------|--------------|---------|
| title | String | String (trimmed) | "Test" → "Test" |
| isActive | String "true"/"false" | Boolean | "true" → true |
| position | String "1" | Number | "1" → 1 |
| startDate | String ISO Date | Date Object | "2024-06-01T00:00:00.000Z" → Date |

**No conversion needed for:**
- subtitle (String)
- buttonText (String)
- buttonLink (String)
- image (File → String path)
