# 🔐 401 Unauthorized - Troubleshooting Guide

## The Problem
You're getting: `Error: Failed to create evaluation: Unauthorized. Please login again.`

This means the authentication token is invalid, expired, or not being sent.

## Quick Fixes (Try These First)

### 1. **Clear localStorage and re-login**
Open browser console (F12) and run:
```javascript
localStorage.clear()
location.reload()
```
Then login again and try creating an evaluation.

### 2. **Check if token exists**
In browser console:
```javascript
// Should return a long string starting with "eyJ..."
localStorage.getItem('token')

// If empty, you're not logged in - LOGIN FIRST!
```

### 3. **Check Network Tab**
1. Open DevTools → Network tab
2. Click "Create Evaluation"
3. Look for the POST request to `/api/formateur/evaluations`
4. Click on it and check:
   - **Headers** tab: Should have `Authorization: Bearer [token]`
   - **Response** tab: Should show the error message

## Detailed Diagnostic Steps

### Step 1: Verify Backend is Running
```
Backend should be at: http://localhost:8087
```
If you see a connection error, **start your backend server first**.

### Step 2: Check Login Works
1. Go to login page
2. Enter credentials
3. **Open console (F12)** - should show:
```
🔐 Login attempt for: email@example.com
📤 HTTP POST http://localhost:8087/api/auth/login
✅ Login successful, token received
```

### Step 3: Verify User Data
After login, check:
```javascript
// In browser console:

// Should show your user data
JSON.parse(localStorage.getItem('user'))

// Example output:
{
  "idUser": 5,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "role": "FORMATEUR"
}
```

### Step 4: Create Evaluation
1. Click "Create Evaluation"
2. Fill in title: `Test Evaluation`
3. Click "Create"
4. **Watch console for logs:**

✅ **Good logs should be:**
```
📝 Submit clicked
Form valid: true
✅ User loaded: 5 Jean Dupont
📤 Creating evaluation with formateurId: 5
📤 HTTP POST http://localhost:8087/api/formateur/evaluations
✅ JwtInterceptor: Adding Authorization header
   Token exists: true
   Token length: 234
   Request: POST http://localhost:8087/api/formateur/evaluations
✅ Evaluation created successfully: 123
```

❌ **Bad logs would show:**
```
⚠️ JwtInterceptor: No token found, sending request without auth
```

## Common Causes & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| No token in localStorage | Not logged in | **Login first** |
| Token exists but 401 error | Token expired | Clear localStorage and re-login |
| Token sent but 401 | Backend doesn't accept format | Check backend token validation |
| "Unauthorized" error | Authentication failed | Check credentials on backend |

## If Still Not Working

Provide these details:
1. **Console log output** (screenshot)
2. **Network tab** (screenshot showing headers)
3. **localStorage contents**:
   ```javascript
   localStorage
   ```
4. **Backend error logs** (if available)

## Backend Token Validation Checklist

Ask backend team:
- Is the `/api/auth/login` endpoint working?
- Is the token being validated correctly?
- Does the token format match `Authorization: Bearer [token]`?
- Is the `/api/formateur/evaluations` endpoint protected?
- Are there CORS issues?

## Test with Postman

1. **Login first:**
   - POST to `http://localhost:8087/api/auth/login`
   - Body: `{"email":"your@email.com","password":"password"}`
   - Copy the token from response

2. **Create evaluation:**
   - POST to `http://localhost:8087/api/formateur/evaluations`
   - Headers: `Authorization: Bearer [paste-token-here]`
   - Body: 
   ```json
   {
     "title": "Test",
     "description": "Test desc",
     "formateurId": 1
   }
   ```

If it works in Postman but not in the app, it's a frontend token handling issue.
