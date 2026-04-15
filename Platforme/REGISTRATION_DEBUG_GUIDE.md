# Registration API Debugging Guide

## Quick Start - Testing Registration

### 1. **Enable Debug Mode** 🔍

Add `?debug` to the registration URL:
```
http://localhost:4200/auth/register?debug
```

This displays a debug panel on the right side showing:
- Request payload
- Form state
- API endpoint details
- Expected headers
- Ready-to-use cURL command

### 2. **Check Browser Console** 📊

Open DevTools (F12) → Console tab and look for:

#### Expected Logs on Success:
```
🔍 RegisterComponent initialized, debug mode: false
📝 Registration Request Details: {...}
📤 Sending to: http://localhost:8087/api/auth/register
✅ Registration successful: {...}
```

#### Expected Logs on Error:
```
❌ Registration failed: {...}
📋 Error Details: {
  status: 400,
  message: "Email already registered",
  fullError: {...}
}
```

---

## Request/Response Format

### Request to Backend
```javascript
POST http://localhost:8087/api/auth/register

Headers:
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}

Body:
{
  "email": "user@example.com",
  "nom": "DoeLastName",
  "prenom": "JohnFirstName",
  "password": "securePassword123"
}
```

**⚠️ NOTE:** No `Authorization` header is sent (this is a public endpoint)

### Expected Response (200 OK)
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "idUser": 1,
  "nom": "DoeLastName",
  "prenom": "JohnFirstName",
  "email": "user@example.com",
  "role": "APPRENANT"
}
```

### Error Responses

| Status | Error | Solution |
|--------|-------|----------|
| **400** | Invalid registration data | Check field validation (email format, password length) |
| **409** | Email already registered | Use a different email or login |
| **422** | Unprocessable entity | Ensure all required fields are present |
| **500** | Server error | Check backend logs, restart backend |
| **0** | Cannot connect | Ensure backend runs at `http://localhost:8087` |

---

## Testing with Postman

### Step 1: Create Request
1. Open Postman
2. Click **+** to create new request
3. Set method: **POST**
4. Set URL: `http://localhost:8087/api/auth/register`

### Step 2: Set Headers
Go to **Headers** tab and add:
```
Content-Type: application/json
Accept: application/json
```

### Step 3: Set Body
Go to **Body** tab → Select **raw** → Select **JSON**

Paste:
```json
{
  "email": "test@example.com",
  "nom": "Doe",
  "prenom": "John",
  "password": "TestPassword123"
}
```

### Step 4: Send & Check Response
Click **Send** and verify:
- ✅ Status: 200 (success) or 409 (already exists)
- ✅ Response contains `token`
- ❌ Any 400/500 errors? Check backend logs

---

## Using cURL Command

### Basic Registration Request
```bash
curl -X POST http://localhost:8087/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "user@example.com",
    "nom": "LastName",
    "prenom": "FirstName",
    "password": "SecurePassword123"
  }'
```

### Copy from Debug Panel
1. Go to `/auth/register?debug`
2. Fill in the form
3. In debug panel, click **📋 Copy to Clipboard**
4. Paste into terminal

---

## Browser Network Tab Debugging

### Step 1: Open DevTools
Press `F12` → **Network** tab

### Step 2: Fill Registration Form
- Email: `testuser@test.com`
- First Name: `John`
- Last Name: `Doe`
- Password: `TestPassword123`
- Confirm Password: `TestPassword123`
- Check Terms checkbox

### Step 3: Click Create Account

### Step 4: Check Network Tab

#### Find the POST request to `/api/auth/register`

**Headers Sent:**
- ✅ `Content-Type: application/json`
- ❌ NO `Authorization` header
- ✅ `Accept: application/json`

**Request Payload:**
```javascript
{
  email: "testuser@test.com",
  nom: "Doe",
  prenom: "John",
  password: "[REDACTED in console]"
}
```

**Response:**
- Status: `200` or `409`
- Body should contain token if successful

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to server"
**Cause:** Backend not running

**Solution:**
```bash
# Check if backend is running on 8087
netstat -an | findstr "8087"  # Windows
lsof -i :8087                   # macOS/Linux

# If not running, start it:
cd backend
npm start
# or
java -jar application.jar
```

### Issue 2: "Email already registered" (409)
**Cause:** Email exists in database

**Solution:**
- Use a different email address
- Or delete user from database manually

### Issue 3: "Invalid registration data" (400)
**Cause:** Missing or malformed fields

**Solution:**
- Ensure all fields are filled:
  - `email`: Valid email format
  - `nom`: At least 2 characters
  - `prenom`: At least 2 characters
  - `password`: At least 8 characters
  - `confirmPassword`: Matches password

### Issue 4: Request shows Authorization header
**Cause:** Auth interceptor incorrectly adding token

**Solution:**
- Check `src/app/interceptors/auth.interceptor.ts`
- Ensure `/api/auth/register` is in public endpoints list
- Clear browser cache and reload

### Issue 5: Form won't submit
**Cause:** Validation errors

**Solution:**
- Red borders indicate invalid fields
- Check error messages below each field
- All fields must be filled correctly
- Checkbox must be checked

---

## Console Logging Reference

### All Logs to Check

```javascript
// Registration component logs
🔍 RegisterComponent initialized, debug mode: [boolean]

// Request logging
📤 POST http://localhost:8087/api/auth/register

// Auth service logs
📝 Register attempt for: user@example.com
   Request body: { email, nom, prenom, password: '[REDACTED]' }

// Success flow
✅ Registration successful: { user, email, role, hasToken }
✅ Response token: [REDACTED] or 'missing'

// Error flow
❌ Registration failed: { status, message, fullError }
📋 Error Details: { status, message, fullError }

// Interceptor logs
📤 HTTP POST http://localhost:8087/api/auth/register
🔓 Public endpoint (no auth needed): POST /api/auth/register
✅ HTTP Response received: POST /api/auth/register
```

---

## Database Verification

### Check if User Created Successfully

```sql
-- MySQL
SELECT * FROM users WHERE email = 'test@example.com';

-- PostgreSQL
SELECT * FROM users WHERE email = 'test@example.com';

-- MongoDB
db.users.findOne({ email: 'test@example.com' })
```

### Expected Fields
```javascript
{
  idUser: 1,
  email: 'test@example.com',
  nom: 'Doe',
  prenom: 'John',
  password: '[HASHED_PASSWORD]',  // Should be hashed, not plain text!
  role: 'APPRENANT',
  isActive: true,
  createdAt: '2026-04-13T...',
  updatedAt: '2026-04-13T...'
}
```

---

## Password Encoder Verification

### Check Backend Logs for Encoding

Look for logs like:
```
✅ Password encoded successfully
✅ User created with id: 1
```

### Force Test
Use a known password and check:
1. Database shows hashed version (NOT plain text)
2. Login with same email/password works
3. Login fails with wrong password

---

## Step-by-Step Debug Checklist

- [ ] Backend running on `http://localhost:8087`
- [ ] Frontend running on `http://localhost:4200`
- [ ] No "Cannot connect to server" error in console
- [ ] Registration form validates (all fields required)
- [ ] Email is unique (not already registered)
- [ ] Password matches confirm password
- [ ] Network tab shows POST to `/api/auth/register`
- [ ] Request has no `Authorization` header
- [ ] Request has `Content-Type: application/json`
- [ ] Response status is 200 or 409 (not 500/0)
- [ ] Response contains `token` field
- [ ] Token is stored in localStorage
- [ ] User redirects to dashboard after success
- [ ] Database shows new user entry
- [ ] Password in DB is hashed (not plain text)

---

## Contact Engineering Team

If issues persist after following this guide:

1. **Collect Debug Information:**
   - Screenshot of debug panel
   - Browser console errors (F12)
   - Network tab request/response
   - Backend logs

2. **Test with Postman:**
   - If Postman works but UI doesn't → Frontend issue
   - If Postman fails → Backend issue

3. **Check Logs:**
   - Frontend: Browser console
   - Backend: Application logs
   - Database: Connection logs

---

**Last Updated:** April 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
