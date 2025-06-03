# Google OAuth Setup Guide

This guide will help you set up Google OAuth credentials for your manual Google authentication implementation.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "G-Auth App")
5. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" 
3. Click on it and press "Enable"
4. Also enable "Google OAuth2 API" if available

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: Your app name (e.g., "G-Auth Demo")
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. On the "Scopes" page, click "Save and Continue" (we'll use basic scopes)
6. On the "Test users" page, add your email address for testing
7. Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Set the name (e.g., "G-Auth Web Client")
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

### 5. Update Environment Variables

Update your `.env.local` file with the credentials:

```bash
# Database
DATABASE_URL="your_postgresql_connection_string_here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# JWT Secret for session management
JWT_SECRET="your_super_secret_jwt_key_here_make_it_long_and_random"

# Base URL of your application
NEXTAUTH_URL="http://localhost:3000"
```

### 6. Set up Database

1. Make sure you have PostgreSQL running
2. Update your `DATABASE_URL` in `.env.local`
3. Run the database migration:
   ```bash
   npm run db:push
   ```

### 7. Generate a Strong JWT Secret

Generate a random secret for JWT tokens:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach {Get-Random -Max 256}))
```

Add this to your `JWT_SECRET` in `.env.local`.

## Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to the dashboard

## Understanding the OAuth Flow

The implemented flow follows these steps:

1. **Authorization Request** (`/api/auth/signin`)
   - Redirects to Google's authorization server
   - Includes client ID, redirect URI, and requested scopes

2. **User Authorization**
   - Google shows consent screen
   - User grants permission

3. **Authorization Code** (`/api/auth/callback/google`)
   - Google redirects back with authorization code
   - Server exchanges code for access token

4. **Access Token Exchange**
   - POST request to Google's token endpoint
   - Receives access token and optionally refresh token

5. **User Information Retrieval**
   - Uses access token to fetch user profile from Google
   - Gets user ID, email, name, and profile picture

6. **Database Operations**
   - Creates new user or updates existing user
   - Stores Google ID for future reference

7. **Session Management**
   - Generates JWT token with user ID
   - Sets secure HTTP-only cookie
   - Redirects to dashboard

## Security Features

- **HTTP-Only Cookies**: Session tokens are not accessible via JavaScript
- **Secure Flag**: Cookies are only sent over HTTPS in production
- **SameSite Protection**: CSRF protection via SameSite cookie attribute
- **JWT Expiration**: Tokens expire after 7 days
- **Environment Variables**: Sensitive credentials stored securely

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Check that your redirect URI in Google Console matches exactly
   - Make sure it includes the protocol (http/https)

2. **"invalid_client" error**
   - Verify your Client ID and Client Secret are correct
   - Check that the OAuth consent screen is configured

3. **Database connection errors**
   - Verify your PostgreSQL database is running
   - Check the `DATABASE_URL` format

4. **CORS errors**
   - Make sure you're accessing the app through the correct domain
   - Check that `NEXTAUTH_URL` matches your current URL

### Debug Mode

Add debug logging by setting environment variable:
```bash
NODE_ENV=development
```

Check the browser console and server logs for detailed error messages.

## Production Deployment

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URI to Google Console
3. Set `NODE_ENV=production`
4. Use a secure database connection
5. Enable HTTPS
6. Regenerate JWT secret for production

## API Endpoints

The implementation provides these endpoints:

- `GET /api/auth/signin` - Initiate Google OAuth flow
- `GET /api/auth/callback/google` - Handle OAuth callback
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/signout` - Sign out and clear session

## File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── signin/route.ts
│   │   ├── callback/google/route.ts
│   │   ├── signout/route.ts
│   │   └── me/route.ts
│   ├── dashboard/page.tsx
│   └── page.tsx
├── hooks/
│   └── useAuth.ts
└── lib/
    └── auth.ts
```

This manual implementation gives you complete control over the authentication flow and helps you understand exactly how OAuth works!