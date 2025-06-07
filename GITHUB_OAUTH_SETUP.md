# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth for your application.

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" in the left sidebar
3. Click "New OAuth App"
4. Fill in the application details:
   - **Application name**: Your app name (e.g., "G-Auth Demo")
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Application description**: Brief description of your app
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

5. Click "Register application"

## Step 2: Get Your Client Credentials

After creating the app, you'll see:
- **Client ID**: Copy this value
- **Client Secret**: Click "Generate a new client secret" and copy the value

## Step 3: Update Environment Variables

Add the GitHub OAuth credentials to your `.env` file:

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID="your_github_client_id_here"
GITHUB_CLIENT_SECRET="your_github_client_secret_here"
```

Replace the placeholder values with your actual GitHub OAuth app credentials.

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try signing in with both Google and GitHub
4. Test the account linking flow by:
   - Signing in with one provider (e.g., Google)
   - Signing out
   - Signing in with the other provider using the same email
   - You should see the account linking page

## Important Notes

- **Callback URL**: Make sure the callback URL in your GitHub OAuth app matches exactly: `http://localhost:3000/api/auth/callback/github`
- **Email Privacy**: If your GitHub email is set to private, make sure to allow access to email addresses in the OAuth scope
- **Production**: For production, update the Homepage URL and Authorization callback URL to your production domain

## Troubleshooting

### "No email received from GitHub"
- Check if your GitHub email is set to private
- Ensure the OAuth app has access to email addresses
- Verify the `user:email` scope is included in the request

### "Invalid callback URL"
- Verify the callback URL in your GitHub OAuth app settings
- Ensure it matches exactly: `http://localhost:3000/api/auth/callback/github`

### "Client ID/Secret errors"
- Double-check your environment variables
- Ensure there are no extra spaces or quotes in the values
- Restart your development server after updating environment variables

## Security Considerations

- Keep your Client Secret secure and never commit it to public repositories
- Use different OAuth apps for development and production environments
- Regularly rotate your Client Secret for security