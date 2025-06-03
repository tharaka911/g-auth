# 🔍 Authentication Logging Guide

## 📋 Overview

Your authentication system now has comprehensive logging throughout the entire flow. This guide helps you understand what logs to expect and how to interpret them.

## 🏷️ Log Categories

All logs are prefixed with category tags:
- `[FRONTEND]` - Client-side React components
- `[API]` - Server-side API routes  
- `[AUTH]` - Authentication library functions

## 🔄 Complete Authentication Flow Logs

### 1. 🚪 **Sign In Process**

When a user clicks "Sign In", you'll see this sequence:

```
🚪 [FRONTEND] useAuth: signIn called - redirecting to /api/auth/signin
🚀 [API] /api/auth/signin endpoint called
🔗 [API] Generating Google OAuth URL...
🔗 [AUTH] Generating Google OAuth URL...
✅ [AUTH] Google OAuth URL generated: https://accounts.google.com/o/oauth2/v2/auth?...
✅ [API] Google OAuth URL generated: https://accounts.google.com/o/oauth2/v2/auth?...
🔄 [API] Redirecting to Google OAuth authorization page
```

### 2. 🔄 **OAuth Callback Process**

After user grants permission on Google, the callback will show:

```
🚀 [API] /api/auth/callback/google endpoint called
📋 [API] OAuth callback params: { hasCode: true, error: 'none' }
🔄 [API] Step 1: Exchanging authorization code for access token...
🔄 [AUTH] Exchanging authorization code for access token...
✅ [AUTH] Successfully exchanged code for access token
✅ [API] Step 1: Access token received successfully
🔄 [API] Step 2: Fetching user info from Google...
🔄 [AUTH] Fetching user info from Google...
✅ [AUTH] Successfully fetched user info from Google: { id: '123...', email: 'user@gmail.com', name: 'John Doe' }
✅ [API] Step 2: Google user info received: { id: '123...', email: 'user@gmail.com', name: 'John Doe' }
🔄 [API] Step 3: Creating/updating user in database...
🔄 [AUTH] Creating/updating user in database for email: user@gmail.com
✅ [AUTH] User created/updated successfully: { id: 'clx...', email: 'user@gmail.com', isNew: false }
✅ [API] Step 3: User created/updated in database: { id: 'clx...', email: 'user@gmail.com' }
🔄 [API] Step 4: Generating JWT session token...
🔑 [AUTH] Generating session token for userId: clx...
✅ [AUTH] Session token generated successfully
✅ [API] Step 4: JWT session token generated
🔄 [API] Step 5: Setting session cookie and redirecting...
🎉 [API] Authentication successful for user: user@gmail.com
🔄 [API] Redirecting to dashboard...
```

### 3. 🔍 **Authentication Check Process**

When the dashboard loads or user refreshes page:

```
🎣 [FRONTEND] useAuth: fetchCurrentUser called
📡 [FRONTEND] useAuth: Making request to /api/auth/me
🚀 [API] /api/auth/me endpoint called
🍪 [API] Session cookie: EXISTS
🔄 [API] Calling getCurrentUser...
👤 [AUTH] getCurrentUser called with sessionToken: TOKEN_EXISTS
🔍 [AUTH] verifySessionToken called with token: TOKEN_EXISTS
✅ [AUTH] Token verified successfully for userId: clx...
🔍 [AUTH] Looking up user with ID: clx...
👤 [AUTH] User found: user@gmail.com (clx...)
✅ [API] getCurrentUser result: Found user: user@gmail.com
📡 [FRONTEND] useAuth: Response received: { status: 200, data: { user: {...} } }
✅ [FRONTEND] useAuth: Setting user state: user@gmail.com
```

### 4. 🚪 **Sign Out Process**

When user clicks logout:

```
🚪 [FRONTEND] useAuth: signOut called
📡 [FRONTEND] useAuth: Making request to /api/auth/signout
🚀 [API] /api/auth/signout endpoint called
🔄 [API] Creating redirect response to home page
🍪 [API] Clearing session cookie
✅ [API] Session cookie cleared successfully
✅ [FRONTEND] useAuth: Signout successful, clearing state
🔄 [FRONTEND] useAuth: Redirecting to home page
```

## 🚨 Error Scenarios

### Invalid/Expired Token
```
🔍 [AUTH] verifySessionToken called with token: TOKEN_EXISTS
❌ [AUTH] Token verification failed: jwt expired
❌ [AUTH] Session verification failed
👤 [AUTH] User found: NOT_FOUND
✅ [API] getCurrentUser result: No user found
📡 [FRONTEND] useAuth: Response received: { status: 200, data: { user: null } }
✅ [FRONTEND] useAuth: Setting user state: null
```

### No Session Cookie
```
🚀 [API] /api/auth/me endpoint called
🍪 [API] Session cookie: NOT_FOUND
❌ [API] No session token found in cookies
📡 [FRONTEND] useAuth: Response received: { status: 200, data: { user: null } }
✅ [FRONTEND] useAuth: Setting user state: null
```

### OAuth Error
```
🚀 [API] /api/auth/callback/google endpoint called
📋 [API] OAuth callback params: { hasCode: false, error: 'access_denied' }
❌ [API] OAuth error received: access_denied
```

## 🔧 How to Monitor Logs

### 1. **Browser Console** (Client-side logs)
```javascript
// Open browser developer tools (F12)
// Go to Console tab
// Look for [FRONTEND] prefixed logs
```

### 2. **Server Terminal** (Server-side logs)
```bash
# In your development terminal where you run:
npm run dev

# Look for [API] and [AUTH] prefixed logs
```

### 3. **Production Monitoring**
```javascript
// For production, consider using services like:
// - Vercel Analytics
// - Sentry
// - LogRocket
// - DataDog
```

## 🎯 Key Logs to Watch

### ✅ **Success Indicators**
- `🎉 [API] Authentication successful for user: email@domain.com`
- `✅ [AUTH] Token verified successfully for userId: xyz`
- `✅ [AUTH] User created/updated successfully`
- `✅ [FRONTEND] useAuth: Setting user state: email@domain.com`

### 🚨 **Error Indicators**
- `❌ [AUTH] Token verification failed: jwt expired`
- `❌ [API] OAuth error received: access_denied`
- `❌ [AUTH] Failed to exchange code for token`
- `❌ [FRONTEND] useAuth: Network error fetching current user`

### 🔍 **Debug Checkpoints**
- `🍪 [API] Session cookie: EXISTS/NOT_FOUND`
- `👤 [AUTH] User found: email@domain.com/NOT_FOUND`
- `🔑 [AUTH] Generating session token for userId: xyz`

## 🛠️ Troubleshooting Common Issues

### **Issue: User not staying logged in**
Look for:
```
❌ [AUTH] Token verification failed: invalid signature
```
**Solution:** Check JWT_SECRET environment variable

### **Issue: Login redirects but doesn't authenticate**
Look for:
```
❌ [API] No access token received from Google
```
**Solution:** Check Google OAuth credentials

### **Issue: Session cookie not being set**
Look for:
```
🍪 [API] Clearing session cookie
✅ [API] Session cookie cleared successfully
```
But missing:
```
🔄 [API] Step 5: Setting session cookie and redirecting...
```
**Solution:** Check NEXTAUTH_URL environment variable

### **Issue: Database connection problems**
Look for:
```
❌ [AUTH] Creating/updating user in database for email: user@email.com
```
Followed by database error
**Solution:** Check DATABASE_URL and database connection

## 📊 Log Analysis Tips

### 1. **Trace Complete Flows**
Follow a single user's journey through the logs by searching for their email address.

### 2. **Time-Based Analysis**
Look at timestamp patterns to identify slow operations:
```bash
# If you see long gaps between:
🔄 [AUTH] Exchanging authorization code for access token...
# and
✅ [AUTH] Successfully exchanged code for access token
# Then Google's token exchange is slow
```

### 3. **Error Pattern Recognition**
Count frequency of specific errors to identify systemic issues:
```bash
# High frequency of:
❌ [AUTH] Token verification failed: jwt expired
# Indicates tokens expiring too quickly or clock sync issues
```

## 🔧 Customizing Logs

### Adding More Detail
```typescript
// In any auth function, add:
console.log('🔍 [AUTH] Custom debug info:', { 
  userId, 
  timestamp: new Date().toISOString(),
  additionalData 
});
```

### Production Log Levels
```typescript
// Use environment-based logging:
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  console.log('🔍 [AUTH] Debug info...');
}
```

### Structured Logging
```typescript
// For production, consider structured logs:
logger.info('User authentication', {
  userId,
  email,
  timestamp: new Date().toISOString(),
  success: true
});
```

## 🎯 Quick Debug Commands

### Check Current Session
```javascript
// In browser console:
document.cookie.split(';').find(c => c.trim().startsWith('session='))
```

### Force Authentication Check
```javascript
// In React component:
const { refetch } = useAuth();
await refetch(); // Will trigger full auth flow logs
```

### Clear Session Manually
```javascript
// In browser console:
document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
location.reload();
```

This comprehensive logging system will help you understand exactly how your authentication system works and quickly identify any issues that arise.