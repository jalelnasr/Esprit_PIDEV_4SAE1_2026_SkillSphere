# 🔍 Complete Frontend Fix - Diagnostic Guide

## What Was Fixed

### 1. ✅ HTTP Error Interceptor
- **File**: `src/app/core/interceptors/error.interceptor.ts` (NEW)
- **Purpose**: Logs all HTTP requests/responses and provides user-friendly error messages
- **Shows**: Connection errors, auth errors, server errors

### 2. ✅ Enhanced Logging
- **AuthService**: Logs login, register, session restore, and logout
- **EvaluationApiService**: Logs all API calls with endpoints
- **QuizApiService**: Logs all quiz operations
- **Error Interceptor**: Logs every request/response/error

### 3. ✅ Better Error Messages
- Shows if backend is not running
- Shows authentication errors
- Shows API endpoint being called
- Shows exact error response

### 4. ✅ Evaluation Creation Form
- Now shows error messages
- Shows loading state with disabled button
- Logs each step of the process
- Better validation

### 5. ✅ Quiz List Page
- Added timeout handling for auth
- Added localStorage fallback
- Shows detailed error messages
- Loads quizzes directly if evaluations fail

## How to Test & Diagnose

### Step 1: Check Backend
```bash
# Verify backend is running at http://localhost:8087
# You should see API responses
```

### Step 2: Open Browser Console (F12)
Look for these logs:
```
✅ AuthService initialized
✅ EvaluationApiService initialized
✅ QuizApiService initialized
📤 HTTP POST http://localhost:8087/api/auth/login
✅ HTTP POST http://localhost:8087/api/auth/login Success
```

### Step 3: Test Login
- Look for: `🔐 Login attempt for: [email]`
- Expected: `✅ Login successful, token received`
- If fails: Error message in console

### Step 4: Test Evaluation Creation
1. Navigate to `/formateur/evaluations/create`
2. Open console (F12)
3. Fill in title, click "Create Evaluation"
4. Watch for logs:
```
📝 Submit clicked
✅ User loaded: [ID] [Name]
📤 Creating evaluation with formateurId: [ID]
📤 HTTP POST http://localhost:8087/api/formateur/evaluations
✅ Evaluation created successfully: [ID]
```

### Step 5: Test Quiz List
1. Navigate to `/formateur/evaluations/quizzes`
2. Open console (F12)
3. Watch for logs:
```
✅ EvaluationQuizDetailComponent initialized
✅ Current user loaded: [ID]
📥 Loading evaluations for formateurId: [ID]
📤 HTTP GET http://localhost:8087/api/formateur/evaluations/formateur/[ID]
✅ Evaluations loaded: X evaluations found
📤 HTTP GET http://localhost:8087/api/formateur/quizzes/[ID]
✅ Quiz [ID] loaded with X questions
```

## Common Issues & Fixes

### Issue: "Cannot connect to server"
**Cause**: Backend not running
**Fix**: Start backend at http://localhost:8087
**Check**: 
```bash
# In browser console, should see:
📤 HTTP GET http://localhost:8087/...
# If you see connection error, backend is down
```

### Issue: 401 Unauthorized
**Cause**: Token expired or not sent
**Fix**: 
- Clear localStorage: `localStorage.clear()` in console
- Refresh page
- Login again

### Issue: 404 Not Found
**Cause**: Wrong API endpoint
**Fix**: Check console logs for exact URL being called
**Expected URLs**:
- `/api/auth/login`
- `/api/formateur/evaluations`
- `/api/formateur/evaluations/formateur/{id}`
- `/api/formateur/quizzes/{id}`

### Issue: Form doesn't submit
**Check**:
1. Is form valid? (all required fields filled)
2. Check browser console for errors
3. Are you authenticated? (Check localStorage for 'token')

## Debug Commands (Run in Browser Console)

```javascript
// Check if token exists
localStorage.getItem('token')

// Check if user is stored
JSON.parse(localStorage.getItem('user'))

// Check stored role
localStorage.getItem('role')

// Clear all auth data
localStorage.clear()

// Check environment
// Should be http://localhost:8087
```

## Network Tab Analysis

1. Open DevTools → Network tab
2. Perform action (create evaluation, load quizzes, etc.)
3. Check each request:
   - **Status**: Should be 200, 201, or 400+
   - **URL**: Should show full endpoint
   - **Headers**: Should have `Authorization: Bearer [token]`
   - **Response**: Should show data or error message

## If Everything Fails

1. **Check backend logs**: Look for error messages in backend console
2. **Verify database**: Ensure data exists in database
3. **Check CORS**: If you see CORS error, backend might not allow requests
4. **Test with Postman**: 
   - POST to `http://localhost:8087/api/auth/login`
   - Add headers: `Content-Type: application/json`
   - Body: `{"email":"test@test.com","password":"password"}`

## Next Step if Still Broken

Provide these details:
1. Browser console screenshot (full errors)
2. Network tab screenshot (failed requests)
3. Backend console output
4. What endpoint is failing (login, create eval, load quizzes?)
