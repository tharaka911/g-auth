# Discord OAuth Setup Guide

This guide explains how to set up Discord OAuth authentication for your application.

## 1. Create Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Enter your application name (e.g., "Your App Name")
4. Click "Create"

## 2. Configure OAuth2 Settings

1. In your application dashboard, go to "OAuth2" in the sidebar
2. Click on "General" under OAuth2
3. Add the following redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/discord`
   - For production: `https://yourdomain.com/api/auth/callback/discord`

## 3. Get Client Credentials

1. In the OAuth2 > General section, you'll find:
   - **Client ID**: Copy this value
   - **Client Secret**: Click "Reset Secret" to generate a new one, then copy it

## 4. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Other required environment variables
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
```

## 5. Database Migration

Run the following command to update your database schema with Discord support:

```bash
npx prisma migrate dev --name add-discord-oauth
```

## 6. Discord OAuth Scopes

The application requests the following Discord scopes:
- `identify`: Access to user's basic profile information
- `email`: Access to user's email address

## 7. User Data Mapping

Discord provides the following user data that gets mapped to our user model:

- **ID**: Discord user ID → `discordId`
- **Email**: User's email address → `email`
- **Username**: Discord username → Used to construct display name
- **Global Name**: Discord display name → `name` (preferred over username)
- **Avatar**: Discord avatar hash → Converted to full avatar URL → `picture`

## 8. Testing

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Continue with Discord"
4. You should be redirected to Discord's OAuth authorization page
5. After authorization, you'll be redirected back to your app

## 9. Account Linking

The system supports linking Discord accounts with existing Google/GitHub accounts:
- If a user signs in with Discord using an email that already exists with another provider, they'll be prompted to link the accounts
- Users can have multiple OAuth providers linked to the same account

## 10. Troubleshooting

### Common Issues:

1. **"Invalid Redirect URI"**: Make sure the redirect URI in Discord matches exactly what's configured in your app
2. **"Environment variable not found"**: Ensure all required environment variables are set in `.env.local`
3. **Database errors**: Run `npx prisma generate` and `npx prisma migrate dev` to update the database schema

### Debug Mode:

The application includes extensive logging. Check the console for detailed OAuth flow information:
- Frontend: Browser console
- Backend: Server console/logs

## 11. Production Deployment

1. Update the redirect URI in Discord to match your production domain
2. Set the production environment variables
3. Run database migrations in production
4. Test the OAuth flow on the production environment

## Features Included

- ✅ Discord OAuth authentication
- ✅ User profile data fetching
- ✅ Account linking with existing providers
- ✅ JWT session management
- ✅ Database integration
- ✅ Error handling and logging
- ✅ Production-ready security settings