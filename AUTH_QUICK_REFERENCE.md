# 🚀 Authentication Quick Reference Guide

## 📋 TL;DR Summary

Your app uses **JWT-based stateless authentication** with Google OAuth2. Sessions are stored as HTTP-only cookies containing JWT tokens, not in the database.

## 🔑 Key Functions Usage

### Frontend (React Components)
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <button onClick={signIn}>Login</button>;
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Backend (API Routes)
```typescript
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  const user = await getCurrentUser(sessionToken);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // User is authenticated
  return NextResponse.json({ data: 'protected data' });
}
```

## 🔄 Authentication Flow Summary

1. **Sign In**: User → Google OAuth → JWT Cookie → Dashboard
2. **Auth Check**: Cookie → JWT Verify → Database Query → User Data
3. **Sign Out**: Clear Cookie → Redirect Home

## 📁 File Structure

```
src/
├── lib/auth.ts                 # 🔧 Core auth functions
├── hooks/useAuth.ts            # ⚛️ React auth hook
└── app/api/auth/
    ├── signin/route.ts         # 🚪 Login endpoint
    ├── callback/google/route.ts # 🔄 OAuth callback
    ├── me/route.ts             # 👤 Current user
    └── signout/route.ts        # 🚪 Logout endpoint
```

## 🛠️ Core Functions

| Function | Purpose | Usage |
|----------|---------|-------|
| [`useAuth()`](src/hooks/useAuth.ts:18) | React hook for auth state | Frontend components |
| [`getCurrentUser()`](src/lib/auth.ts:117) | Get user from JWT | API routes |
| [`verifySessionToken()`](src/lib/auth.ts:107) | Validate JWT | Internal use |
| [`generateSessionToken()`](src/lib/auth.ts:92) | Create JWT | OAuth callback |

## 🔐 Security Features

- ✅ **HTTP-Only Cookies** - Prevents XSS
- ✅ **Secure Flag** - HTTPS enforcement
- ✅ **SameSite Protection** - CSRF prevention  
- ✅ **JWT Expiration** - 7-day auto-logout
- ✅ **Multi-Device Support** - Independent sessions

## 🎯 Common Use Cases

### Protect API Route
```typescript
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request.cookies.get('session')?.value);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Protected logic here
}
```

### Protect Page Component
```typescript
function ProtectedPage() {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <LoginPrompt />;
  
  return <DashboardContent user={user} />;
}
```

### Manual Auth Check
```typescript
const { user, refetch } = useAuth();

// Refresh auth state after sensitive operations
await performSensitiveAction();
await refetch();
```

## ⚡ Quick Debugging

### Check Authentication Status
```typescript
// In browser console:
document.cookie; // Should show 'session=...' if logged in

// In server logs:
console.log('Session token:', request.cookies.get('session')?.value);
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| User not staying logged in | Missing/invalid JWT_SECRET | Check environment variables |
| Cookie not set | HTTP vs HTTPS mismatch | Check secure flag settings |
| Authentication loop | Expired token not cleared | Clear browser cookies |
| Multi-tab issues | State not syncing | Use `refetch()` method |

## 🔧 Environment Setup

```env
# Required environment variables
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_super_secret_key_min_32_chars
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_database_connection
```

## 📊 Advantages vs Disadvantages

### ✅ Advantages
- **Stateless** - No database session storage
- **Scalable** - Works across multiple servers
- **Multi-device** - Independent sessions per device
- **Performance** - No DB lookup for every request

### ❌ Disadvantages  
- **No immediate logout** - Can't revoke tokens instantly
- **No session tracking** - Can't see active sessions
- **Token theft risk** - Stolen JWT valid until expiration

## 🚨 Security Best Practices

1. **Keep JWT_SECRET secure** - Use environment variables
2. **Use HTTPS in production** - Enable secure cookie flag
3. **Monitor token expiration** - Implement refresh tokens if needed
4. **Validate on every request** - Always check token validity
5. **Log security events** - Track auth failures and anomalies

## 🔄 Upgrade Paths

### Add Refresh Tokens
```typescript
interface TokenPair {
  accessToken: string;  // 15 minutes
  refreshToken: string; // 7 days
}
```

### Add Session Tracking
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}
```

### Add Token Blacklisting
```typescript
const blacklistedTokens = new Set<string>();

export function isTokenBlacklisted(token: string): boolean {
  return blacklistedTokens.has(token);
}
```

## 🧪 Testing Checklist

- [ ] Login flow works end-to-end
- [ ] User stays logged in on page refresh
- [ ] Logout clears session properly
- [ ] Protected routes redirect to login
- [ ] Token expiration handled gracefully
- [ ] Multi-tab authentication syncs
- [ ] Multi-device sessions work independently

## 📚 Related Documentation

- [📖 Complete Authentication Documentation](AUTHENTICATION_DOCUMENTATION.md)
- [🔄 Flow Diagrams](AUTHENTICATION_FLOW_DIAGRAM.md)
- [🏗️ Architecture Overview](IMPLEMENTATION_SUMMARY.md)
- [🔧 Google OAuth Setup](GOOGLE_OAUTH_SETUP.md)

---

**Need help?** Check the detailed documentation files or examine the authentication flow diagrams for visual understanding of the system architecture.