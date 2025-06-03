# 🔄 Authentication Flow Diagrams

## 🚀 Complete Sign-In Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant SignInAPI as /api/auth/signin
    participant Google
    participant CallbackAPI as /api/auth/callback/google
    participant AuthLib as auth.ts
    participant Database
    participant MeAPI as /api/auth/me
    
    Note over User,MeAPI: Initial Login Process
    
    User->>Frontend: Click "Sign In" button
    Frontend->>Browser: window.location.href = '/api/auth/signin'
    Browser->>SignInAPI: GET /api/auth/signin
    SignInAPI->>AuthLib: getGoogleAuthUrl()
    AuthLib-->>SignInAPI: Google OAuth URL
    SignInAPI-->>Browser: Redirect to Google OAuth
    Browser->>Google: OAuth authorization request
    
    Note over Google: User grants permissions
    
    Google-->>Browser: Redirect with authorization code
    Browser->>CallbackAPI: GET /api/auth/callback/google?code=xyz
    
    Note over CallbackAPI,Database: Token Exchange & User Creation
    
    CallbackAPI->>AuthLib: exchangeCodeForToken(code)
    AuthLib->>Google: Exchange code for access token
    Google-->>AuthLib: Access token
    AuthLib-->>CallbackAPI: Token response
    
    CallbackAPI->>AuthLib: getGoogleUserInfo(accessToken)
    AuthLib->>Google: Get user profile
    Google-->>AuthLib: User profile data
    AuthLib-->>CallbackAPI: Google user data
    
    CallbackAPI->>AuthLib: createOrUpdateUser(googleUser)
    AuthLib->>Database: UPSERT user record
    Database-->>AuthLib: User record
    AuthLib-->>CallbackAPI: Database user
    
    CallbackAPI->>AuthLib: generateSessionToken(user.id)
    AuthLib-->>CallbackAPI: JWT token
    
    CallbackAPI-->>Browser: Set HTTP-only cookie + Redirect to /dashboard
    Browser->>Frontend: Load dashboard page
    
    Note over Frontend,MeAPI: Authentication Check
    
    Frontend->>MeAPI: GET /api/auth/me (with cookie)
    MeAPI->>AuthLib: getCurrentUser(sessionToken)
    AuthLib->>AuthLib: verifySessionToken(token)
    AuthLib->>Database: findUnique user by ID
    Database-->>AuthLib: User data
    AuthLib-->>MeAPI: User profile
    MeAPI-->>Frontend: { user: {...} }
    Frontend->>User: Show authenticated dashboard
```

## 🔍 Authentication Check Flow (Return User)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant MeAPI as /api/auth/me
    participant AuthLib as auth.ts
    participant Database
    
    Note over User,Database: User visits app (already has session cookie)
    
    User->>Browser: Visit application
    Browser->>Frontend: Load page
    Frontend->>Frontend: useAuth() hook initializes
    Frontend->>MeAPI: GET /api/auth/me (cookie sent automatically)
    
    Note over MeAPI,Database: Server-side authentication
    
    MeAPI->>MeAPI: Extract 'session' cookie
    MeAPI->>AuthLib: getCurrentUser(sessionToken)
    
    alt Valid JWT Token
        AuthLib->>AuthLib: verifySessionToken(token)
        Note over AuthLib: JWT signature valid & not expired
        AuthLib->>Database: findUnique({ where: { id: userId } })
        Database-->>AuthLib: User record
        AuthLib-->>MeAPI: User profile data
        MeAPI-->>Frontend: { user: { id, email, name, image } }
        Frontend->>Frontend: Set authenticated state
        Frontend->>User: Show authenticated UI
    else Invalid/Expired JWT
        AuthLib->>AuthLib: verifySessionToken(token) fails
        AuthLib-->>MeAPI: null
        MeAPI-->>Frontend: { user: null }
        Frontend->>Frontend: Set unauthenticated state
        Frontend->>User: Show login UI
    end
```

## 🚪 Sign-Out Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant SignOutAPI as /api/auth/signout
    participant Browser
    
    Note over User,Browser: User initiates logout
    
    User->>Frontend: Click "Sign Out" button
    Frontend->>SignOutAPI: POST /api/auth/signout
    SignOutAPI->>SignOutAPI: Create response with redirect to '/'
    SignOutAPI->>SignOutAPI: Set session cookie with maxAge: 0
    SignOutAPI-->>Frontend: Response with cleared cookie
    Frontend->>Frontend: setAuthState({ user: null })
    Frontend->>Browser: window.location.href = '/'
    Browser->>Frontend: Load homepage
    Frontend->>User: Show unauthenticated homepage
```

## 🔐 JWT Token Lifecycle

```mermaid
graph TD
    A[User Login] --> B{Google OAuth Success?}
    B -->|Yes| C[Generate JWT Token]
    B -->|No| D[Redirect to Error Page]
    
    C --> E[Set HTTP-Only Cookie]
    E --> F[JWT Token Active - 7 Days]
    
    F --> G{Token Usage}
    G --> H[API Request with Cookie]
    H --> I{JWT Valid?}
    
    I -->|Valid| J[Extract User ID]
    I -->|Invalid/Expired| K[Return null]
    
    J --> L[Query Database]
    L --> M[Return User Data]
    
    K --> N[User Logged Out]
    
    F --> O{7 Days Passed?}
    O -->|Yes| P[Token Expires]
    O -->|No| G
    
    P --> N
    
    Q[Manual Logout] --> R[Clear Cookie]
    R --> N
    
    style F fill:#e1f5fe
    style N fill:#ffebee
    style M fill:#e8f5e8
```

## 🔄 Multi-Device Session Management

```mermaid
graph TB
    subgraph "Device 1 - Desktop"
        D1[Browser 1] --> C1[Cookie 1]
        C1 --> J1[JWT Token 1]
    end
    
    subgraph "Device 2 - Mobile"
        D2[Browser 2] --> C2[Cookie 2] 
        C2 --> J2[JWT Token 2]
    end
    
    subgraph "Device 3 - Tablet"
        D3[Browser 3] --> C3[Cookie 3]
        C3 --> J3[JWT Token 3]
    end
    
    J1 --> U[Same User ID]
    J2 --> U
    J3 --> U
    
    U --> DB[(Database User Record)]
    
    Note1[Each device has independent JWT]
    Note2[Logout on one device doesn't affect others]
    Note3[Each JWT expires independently]
    
    style U fill:#e8f5e8
    style DB fill:#e1f5fe
```

## 🛡️ Security Layer Breakdown

```mermaid
graph LR
    subgraph "Client Side"
        A[Browser] --> B[HTTP-Only Cookie]
        B --> C[Cannot Access via JavaScript]
    end
    
    subgraph "Network"
        D[HTTPS Only] --> E[Secure Cookie Flag]
        E --> F[SameSite Protection]
    end
    
    subgraph "Server Side"
        G[JWT Verification] --> H[Secret Key Validation]
        H --> I[Expiration Check]
        I --> J[User ID Extraction]
    end
    
    subgraph "Database"
        K[User Lookup] --> L[Profile Data]
    end
    
    C --> D
    F --> G
    J --> K
    
    style C fill:#ffcdd2
    style F fill:#fff3e0
    style I fill:#e8f5e8
    style L fill:#e1f5fe
```

## 🔧 Function Call Chain

```mermaid
graph TD
    A[User Action] --> B{Action Type}
    
    B -->|Sign In| C[useAuth.signIn()]
    B -->|Check Auth| D[useAuth.fetchCurrentUser()]
    B -->|Sign Out| E[useAuth.signOut()]
    
    C --> F[/api/auth/signin]
    F --> G[getGoogleAuthUrl()]
    G --> H[Google OAuth Flow]
    H --> I[/api/auth/callback/google]
    I --> J[exchangeCodeForToken()]
    J --> K[getGoogleUserInfo()]
    K --> L[createOrUpdateUser()]
    L --> M[generateSessionToken()]
    
    D --> N[/api/auth/me]
    N --> O[getCurrentUser()]
    O --> P[verifySessionToken()]
    P --> Q[Database Query]
    
    E --> R[/api/auth/signout]
    R --> S[Clear Cookie]
    
    style G fill:#e3f2fd
    style M fill:#e8f5e8
    style P fill:#fff3e0
    style S fill:#ffebee
```

## 📊 Data Flow Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Components] --> B[useAuth Hook]
        B --> C[Auth State Management]
    end
    
    subgraph "API Layer"
        D[/api/auth/signin] 
        E[/api/auth/callback/google]
        F[/api/auth/me]
        G[/api/auth/signout]
    end
    
    subgraph "Business Logic"
        H[auth.ts Library]
        I[JWT Functions]
        J[Google OAuth Functions]
        K[User Management]
    end
    
    subgraph "Data Layer"
        L[(PostgreSQL/MySQL)]
        M[User Table]
        N[Prisma ORM]
    end
    
    subgraph "External Services"
        O[Google OAuth2]
        P[Google User Info API]
    end
    
    C --> D
    C --> F
    C --> G
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I
    H --> J
    H --> K
    
    J --> O
    J --> P
    K --> N
    N --> L
    L --> M
    
    style C fill:#e8f5e8
    style H fill:#e1f5fe
    style N fill:#fff3e0
    style O fill:#ffebee
```

This visual documentation complements the detailed written documentation and provides clear visual representations of your authentication system's architecture and flow.