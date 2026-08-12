# 🚀 RESTART INSTRUCTIONS - DO THIS NOW

## ✅ What Was Fixed (Completed)

1. **Backend** - Added `/images` route to serve images
2. **Frontend** - Fixed `.env.local` to use correct port (7410)
3. **Frontend** - Updated `next.config.ts` to proxy `/images` requests
4. **Images** - Created placeholder images for mock data

---

## ⚠️ CRITICAL: You MUST Restart Both Servers

Changes to `index.js`, `.env.local`, and `next.config.ts` require server restarts!

---

## 🔴 Step 1: Restart Backend Server

Open your backend terminal and:

```bash
# Press Ctrl+C to stop the server

# Navigate to backend folder
cd c:\Codzcart\Keshrag-backend-main

# Restart server
node index.js
```

**Expected Output:**
```
DB is connected...
server is running on port 7410...
```

✅ **If you see this:** Backend is running correctly  
❌ **If you see errors:** Check MongoDB connection or port already in use

---

## 🔵 Step 2: Restart Frontend Server

Open your frontend terminal and:

```bash
# Press Ctrl+C to stop the server

# Navigate to frontend folder
cd c:\Codzcart\keshrag-user-main

# Restart server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

✅ **If you see this:** Frontend is running correctly  
❌ **If port 3000 is busy:** It will use another port (check the output)

---

## 🧪 Step 3: Test The Fix

### Test A: Open Frontend in Browser

1. Open: `http://localhost:3000` (or the port shown)
2. Open **DevTools** (press F12)
3. Go to **Network** tab
4. Reload the page

**What to check:**
- Look for `/images/cat-silk.jpg`, `/images/cat-cotton.jpg` requests
- Status should be **200 OK** (not 404)
- Images should display on the page

✅ **If images show:** Quick fix successful!  
❌ **If still 404:** Server wasn't restarted properly

---

### Test B: Check Environment Variable

In browser console, type:
```javascript
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
```

**Expected Output:**
```
http://localhost:7410
```

✅ **If correct:** Environment variable loaded  
❌ **If wrong or undefined:** Frontend server wasn't restarted

---

### Test C: Test Backend Directly

In a new terminal or browser:
```bash
# Test product API
curl http://localhost:7410/api/user/products

# Test image serving
curl http://localhost:7410/images/cat-silk.jpg
```

**Expected:**
- Products API returns JSON with products array
- Image request returns image data (not 404)

---

## 📋 Quick Troubleshooting

### Issue: Backend won't start
**Error:** `Port 7410 already in use`

**Solution:**
```bash
# Windows - Find and kill process on port 7410
netstat -ano | findstr :7410
# Note the PID (last column)
taskkill /PID <PID_NUMBER> /F

# Then restart
node index.js
```

---

### Issue: Frontend won't start
**Error:** `Port 3000 already in use`

**Solution:**
- Next.js will automatically try port 3001, 3002, etc.
- Just use the port it shows in the output
- OR kill the process on port 3000 first

---

### Issue: Images still 404
**Possible Causes:**

1. **Server not restarted**
   - Solution: Make sure you pressed Ctrl+C and restarted both servers

2. **Wrong URL**
   - Check browser console: What URL is being requested?
   - Should be: `http://localhost:3000/images/cat-silk.jpg`
   - Next.js will proxy it to: `http://localhost:7410/images/cat-silk.jpg`

3. **Backend not running**
   - Test: `curl http://localhost:7410/images/cat-silk.jpg`
   - Should return image data

4. **Frontend not picking up .env changes**
   - Delete `.next` folder: `rmdir /s /q .next`
   - Restart: `npm run dev`

---

### Issue: Products still not showing
**Root Cause:** Frontend is still using mock data from files

**Temporary Solution:** The placeholder images will prevent 404 errors, but products are still hardcoded

**Permanent Solution:** Update frontend components to use API (see `FRONTEND_INTEGRATION_FIX.md`)

---

## 📊 Status Check

After restart, verify:

### Backend (Port 7410)
- [ ] Server started successfully
- [ ] "DB is connected" message shown
- [ ] No error messages in terminal
- [ ] Can access: `http://localhost:7410/api/user/products`
- [ ] Can access: `http://localhost:7410/images/cat-silk.jpg`

### Frontend (Port 3000)
- [ ] Server started successfully
- [ ] "Ready" message shown
- [ ] Can access: `http://localhost:3000`
- [ ] Images load (no 404 in Network tab)
- [ ] Console shows correct API_BASE_URL

---

## ✅ Success Criteria

You'll know everything is working when:

1. **Backend Terminal:**
   ```
   DB is connected...
   server is running on port 7410...
   ```

2. **Frontend Terminal:**
   ```
   ▲ Next.js 15.x.x
   - Local: http://localhost:3000
   - Ready in X.Xs
   ```

3. **Browser:**
   - Homepage loads
   - Images display (no broken image icons)
   - No 404 errors in Network tab
   - No red errors in Console

4. **Browser Console:**
   ```javascript
   process.env.NEXT_PUBLIC_API_BASE_URL
   // Returns: "http://localhost:7410"
   ```

---

## 🎯 What's Fixed vs What's Next

### ✅ Fixed (Images won't 404 anymore):
- Backend serves images at `/images/*`
- Frontend configured to use port 7410
- Placeholder images created for mock data
- Next.js proxies image requests to backend

### ⚠️ Still To Do (Products are mock data):
- Frontend components need to use real API
- Replace `import { products } from "@/data/productsData"` with API calls
- Use `getProducts()` from `AllApi.js`
- Connect cart, wishlist, etc. to backend

**See:** `FRONTEND_INTEGRATION_FIX.md` for complete integration guide

---

## 📞 Quick Reference

### Restart Commands:
```bash
# Backend
cd c:\Codzcart\Keshrag-backend-main
node index.js

# Frontend
cd c:\Codzcart\keshrag-user-main
npm run dev
```

### Test Commands:
```bash
# Backend API
curl http://localhost:7410/api/user/products

# Backend images
curl http://localhost:7410/images/cat-silk.jpg

# Frontend
# Open http://localhost:3000 in browser
```

### Port Check:
```bash
# Windows - Check if ports are in use
netstat -ano | findstr :7410
netstat -ano | findstr :3000
```

---

## 🚨 DO THIS NOW

1. ⚠️ Stop backend (Ctrl+C)
2. ⚠️ Stop frontend (Ctrl+C)
3. ⚠️ Restart backend: `node index.js`
4. ⚠️ Restart frontend: `npm run dev`
5. ✅ Open `http://localhost:3000` in browser
6. ✅ Check Network tab - images should be 200, not 404

**Then:** Images will load correctly!

**Next:** Read `FRONTEND_INTEGRATION_FIX.md` to connect frontend to real API

---

**Created:** June 13, 2026  
**Estimated Time:** 2 minutes to restart, 1 minute to verify  
**Result:** Images will load, 404 errors will be gone ✅

