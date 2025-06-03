# 🔐 Stateless JWT Authentication System Documentation

## Overview

This application implements a **stateless JWT-based authentication system** using Google OAuth2. Sessions are managed entirely through JWT tokens stored in HTTP-only cookies, eliminating the need for database session storage.

## 🏗️ Architecture Overview

```mermaid
graph TB
    A[User Clicks Login] --> B[/api/auth/signin]
    B --> C[Google OAuth2]
    C --> D[/api/auth/callback/google]
    D --> E[Generate JWT Token]
    E --> F[Set HTTP-Only Cookie]
    F --> G[Redirect to Dashboard]
    
    H[Protected Request] --> I[Extract JWT from Cookie]
    I --> J[Verify JWT Token]
    J --> K[Extract User ID]
    K --> L[Fetch User from Database]
    L --> M[Return User Data]
```

## 🔑 Core Components

### 1. Authentication Library (`src/lib/auth.ts`)

**Key Functions:**
- [`getGoogleAuthUrl()`](src/lib/auth.ts:16) - Generates Google OAuth URL
- [`exchangeCodeForToken()`](src/lib/auth.ts:30) - Exchanges auth code for access token
- [`getGoogleUserInfo()`](src/lib/auth.ts:53) - Fetches user data from Google
- [`createOrUpdateUser()`](src/lib/auth.ts:72) - Upserts user in database
- [`generateSessionToken()`](src/lib/auth.ts:92) - Creates JWT token
- [`verifySessionToken()`](src/lib/auth.ts:107) - Validates JWT token
- [`getCurrentUser()`](src/lib/auth.ts:117) - Gets user from session token

### 2. API Routes

- [`/api/auth/signin`](src/app/api/auth/signin/route.ts) - Initiates Google OAuth
- [`/api/auth/callback/google`](src/app/api/auth/callback/google/route.ts) - Handles OAuth callback
- [`/api/auth/me`](src/app/api/auth/me/route.ts) - Returns current user
- [`/api/auth/signout`](src/app/api/auth/signout/route.ts) - Clears session cookie

### 3. Frontend Hook (`src/hooks/useAuth.ts`)

Provides React components with authentication state and methods.

---

## 🚀 Authentication Flow - Step by Step

### 📝 **Sign In Process**

#### Step 1: User Initiates Login
```typescript
// User clicks login button
const { signIn } = useAuth();
signIn(); // Redirects to /api/auth/signin
```

#### Step 2: Redirect to Google OAuth
```typescript
// File: src/app/api/auth/signin/route.ts
export async function GET() {
  const authUrl = getGoogleAuthUrl();
  return NextResponse.redirect(authUrl);
}
```

**What happens:**
- Generates Google OAuth URL with client ID, redirect URI, and scopes
- Redirects user to Google's authorization page

#### Step 3: Google OAuth Authorization
```typescript
// File: src/lib/auth.ts - getGoogleAuthUrl()
const params = new URLSearchParams({
  client_id: GOOGLE_AUTH_CONFIG.clientId,
  redirect_uri: GOOGLE_AUTH_CONFIG.redirectUri,
  scope: 'openid email profile',
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent',
});
```

**What happens:**
- User sees Google's consent screen
- User grants permissions
- Google redirects back with authorization code

#### Step 4: Handle OAuth Callback
```typescript
// File: src/app/api/auth/callback/google/route.ts
export async function GET(request: NextRequest) {
  const code = searchParams.get('code');
  
  // Exchange code for access token
  const tokenResponse = await exchangeCodeForToken(code);
  
  // Get user info from Google
  const googleUser = await getGoogleUserInfo(tokenResponse.access_token);
  
  // Create/update user in database
  const user = await createOrUpdateUser(googleUser);
  
  // Generate JWT session token
  const sessionToken = generateSessionToken(user.id);
  
  // Set secure HTTP-only cookie
  response.cookies.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  // Redirect to dashboard
  return NextResponse.redirect('/dashboard');
}
```

**What happens:**
1. **Token Exchange**: Authorization code → Access token
2. **User Data Fetch**: Access token → Google user profile
3. **Database Upsert**: Create or update user record
4. **JWT Generation**: User ID → Signed JWT token
5. **Cookie Setting**: JWT → HTTP-only secure cookie
6. **Redirect**: User → Dashboard page

#### Step 5: JWT Token Structure
```typescript
// Generated JWT contains:
{
  userId: "clx1y2z3a4b5c6d7e8f9g0h1", // Database user ID
  iat: 1234567890,                     // Issued at timestamp
  exp: 1234567890                      // Expires in 7 days
}
```

---

### 🔍 **Authentication Check Process**

#### Step 1: Component Mounts
```typescript
// File: src/hooks/useAuth.ts
useEffect(() => {
  fetchCurrentUser(); // Called on component mount
}, []);
```

#### Step 2: Fetch Current User
```typescript
// File: src/hooks/useAuth.ts
const fetchCurrentUser = async () => {
  const response = await fetch('/api/auth/me');
  const data = await response.json();
  setAuthState({ user: data.user, loading: false });
};
```

#### Step 3: Server-Side Authentication
```typescript
// File: src/app/api/auth/me/route.ts
export async function GET(request: NextRequest) {
  // Extract JWT from cookie
  const sessionToken = request.cookies.get('session')?.value;
  
  if (!sessionToken) {
    return NextResponse.json({ user: null });
  }
  
  // Get user using JWT
  const user = await getCurrentUser(sessionToken);
  return NextResponse.json({ user });
}
```

#### Step 4: JWT Verification & User Lookup
```typescript
// File: src/lib/auth.ts
export async function getCurrentUser(sessionToken?: string) {
  if (!sessionToken) return null;
  
  // Verify JWT signature and decode payload
  const session = verifySessionToken(sessionToken);
  if (!session) return null;
  
  // Fetch user from database using ID from JWT
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, image: true }
  });
  
  return user;
}

export function verifySessionToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return { userId: decoded.userId };
  } catch {
    return null; // Invalid or expired token
  }
}
```

**What happens:**
1. **Cookie Extraction**: HTTP-only cookie → JWT token
2. **JWT Verification**: Token signature validation using secret
3. **Payload Decode**: JWT → User ID
4. **Database Query**: User ID → User profile data
5. **Response**: User data → Frontend state

---

### 🚪 **Sign Out Process**

#### Step 1: User Initiates Logout
```typescript
// User clicks logout button
const { signOut } = useAuth();
await signOut();
```

#### Step 2: Clear Session Cookie
```typescript
// File: src/hooks/useAuth.ts
const signOut = async () => {
  const response = await fetch('/api/auth/signout', { method: 'POST' });
  
  if (response.ok) {
    setAuthState({ user: null, loading: false, error: null });
    window.location.href = '/';
  }
};
```

#### Step 3: Server-Side Cookie Clearing
```typescript
// File: src/app/api/auth/signout/route.ts
export async function POST() {
  const response = NextResponse.redirect('/');
  
  // Clear session cookie by setting maxAge to 0
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  return response;
}
```

**What happens:**
1. **API Call**: Frontend → `/api/auth/signout`
2. **Cookie Clearing**: Set cookie with `maxAge: 0`
3. **State Reset**: Clear user from frontend state
4. **Redirect**: User → Home page

---

### 🔄 **Return User Login Process**

#### Automatic Authentication Check
```typescript
// File: src/hooks/useAuth.ts
// On every page load/refresh:
useEffect(() => {
  fetchCurrentUser(); // Checks if valid JWT exists
}, []);
```

**What happens:**
1. **Page Load**: Component mounts
2. **Cookie Check**: Browser sends HTTP-only cookie automatically
3. **JWT Validation**: Server verifies token validity
4. **User Restoration**: If valid, user is automatically logged in
5. **State Update**: Frontend receives user data and updates UI

#### Token Expiration Handling
- **Valid Token**: User remains logged in
- **Expired Token**: User automatically logged out
- **Invalid Token**: User automatically logged out
- **No Token**: User sees login screen

---

## 🔧 Technical Implementation Details

### JWT Configuration
```typescript
// File: src/lib/auth.ts
export function generateSessionToken(userId: string): string {
  return jwt.sign(
    { userId, iat: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}
```

### Cookie Security Settings
```typescript
// Production-ready cookie configuration
response.cookies.set('session', sessionToken, {
  httpOnly: true,          // Prevents XSS attacks
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',        // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',              // Available site-wide
});
```

### Database Schema
```prisma
// File: prisma/schema.prisma
model User {
  id       String  @id @default(cuid())
  email    String  @unique
  name     String?
  image    String?
  googleId String? @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## ✅ Advantages of This Approach

### 🚀 **Performance**
- **No Database Lookups for Session Validation**: JWT is self-contained
- **Stateless**: No server memory usage for session storage
- **Scalable**: Works across multiple server instances without sync

### 🔒 **Security**
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS enforcement in production
- **SameSite Protection**: Prevents CSRF attacks
- **JWT Expiration**: Built-in token expiration

### 🌍 **Multi-Device Support**
- **Independent Sessions**: Each device gets its own JWT
- **No Session Conflicts**: Logging in on new device doesn't affect others
- **Seamless Experience**: Users can be logged in on multiple devices

### 🛠️ **Development**
- **Simple Implementation**: No complex session storage logic
- **Easy Debugging**: JWT payload is readable (when decoded)
- **Framework Agnostic**: Works with any backend framework

---

## ❌ Disadvantages of This Approach

### 🔐 **Security Concerns**
- **No Immediate Revocation**: Can't invalidate JWTs before expiration
- **Token Theft Risk**: If JWT is stolen, it remains valid until expiration
- **No "Logout All Devices"**: Each JWT must expire naturally

### 🗄️ **Session Management**
- **No Active Session Tracking**: Can't see who's currently logged in
- **No Session Analytics**: Can't track session duration or activity
- **No Granular Control**: Can't revoke specific sessions

### 🔄 **Token Management**
- **Fixed Expiration**: Can't extend session without re-authentication
- **Size Limitation**: JWTs can become large with additional claims
- **Secret Rotation**: Changing JWT secret invalidates all tokens

---

## 🔮 Potential Improvements

### 1. **Refresh Token Implementation**
```typescript
// Add refresh token for seamless re-authentication
interface TokenPair {
  accessToken: string;  // Short-lived (15 minutes)
  refreshToken: string; // Long-lived (7 days)
}
```

### 2. **Database Session Tracking**
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

### 3. **Token Blacklisting**
```typescript
// Add revoked tokens to blacklist
const revokedTokens = new Set<string>();

export function revokeToken(token: string) {
  revokedTokens.add(token);
}
```

### 4. **Enhanced Security**
```typescript
// Add device fingerprinting and IP tracking
interface JWTPayload {
  userId: string;
  deviceId: string;
  ipAddress: string;
  iat: number;
  exp: number;
}
```

---

## 🧪 Testing Your Authentication

### 1. **Test Login Flow**
1. Visit your app homepage
2. Click login button
3. Complete Google OAuth
4. Verify redirect to dashboard
5. Check browser cookies for `session` cookie

### 2. **Test Session Persistence**
1. Login successfully
2. Refresh the page
3. Verify you remain logged in
4. Close browser and reopen
5. Verify you remain logged in

### 3. **Test Logout Flow**
1. While logged in, click logout
2. Verify redirect to homepage
3. Check that session cookie is cleared
4. Try accessing protected routes

### 4. **Test Token Expiration**
1. Login successfully
2. Manually expire the JWT (modify expiration in code temporarily)
3. Refresh page
4. Verify automatic logout

---

## 🔧 Environment Variables Required

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key

# Application URL
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_database_connection_string
```

---

## 📚 Related Files

- [`src/lib/auth.ts`](src/lib/auth.ts) - Core authentication functions
- [`src/hooks/useAuth.ts`](src/hooks/useAuth.ts) - React authentication hook  
- [`src/app/api/auth/signin/route.ts`](src/app/api/auth/signin/route.ts) - Login endpoint
- [`src/app/api/auth/callback/google/route.ts`](src/app/api/auth/callback/google/route.ts) - OAuth callback
- [`src/app/api/auth/me/route.ts`](src/app/api/auth/me/route.ts) - Current user endpoint
- [`src/app/api/auth/signout/route.ts`](src/app/api/auth/signout/route.ts) - Logout endpoint
- [`prisma/schema.prisma`](prisma/schema.prisma) - Database schema

This documentation provides a complete understanding of your stateless JWT authentication system, including all code-level details, advantages, disadvantages, and potential improvements.