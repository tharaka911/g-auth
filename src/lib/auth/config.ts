// OAuth provider configurations

// Google OAuth URLs and configuration
export const GOOGLE_AUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
  scope: 'openid email profile',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

// GitHub OAuth URLs and configuration
export const GITHUB_AUTH_CONFIG = {
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
  scope: 'user:email',
  authUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userInfoUrl: 'https://api.github.com/user',
  userEmailUrl: 'https://api.github.com/user/emails',
};