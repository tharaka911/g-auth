// Environment validation and configuration
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
} as const;

// Validate that all required environment variables are present
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Validated environment variables - guaranteed to be defined
export const ENV = {
  NEXTAUTH_URL: requiredEnvVars.NEXTAUTH_URL!,
  GOOGLE_CLIENT_ID: requiredEnvVars.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: requiredEnvVars.GOOGLE_CLIENT_SECRET!,
  GITHUB_CLIENT_ID: requiredEnvVars.GITHUB_CLIENT_ID!,
  GITHUB_CLIENT_SECRET: requiredEnvVars.GITHUB_CLIENT_SECRET!,
  DISCORD_CLIENT_ID: requiredEnvVars.DISCORD_CLIENT_ID!,
  DISCORD_CLIENT_SECRET: requiredEnvVars.DISCORD_CLIENT_SECRET!,
  JWT_SECRET: requiredEnvVars.JWT_SECRET!,
  DATABASE_URL: requiredEnvVars.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Google OAuth configuration
export const GOOGLE_AUTH_CONFIG = {
  clientId: ENV.GOOGLE_CLIENT_ID,
  clientSecret: ENV.GOOGLE_CLIENT_SECRET,
  redirectUri: `${ENV.NEXTAUTH_URL}/api/auth/callback/google`,
  scope: 'openid email profile',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
} as const;

// GitHub OAuth configuration
export const GITHUB_AUTH_CONFIG = {
  clientId: ENV.GITHUB_CLIENT_ID,
  clientSecret: ENV.GITHUB_CLIENT_SECRET,
  redirectUri: `${ENV.NEXTAUTH_URL}/api/auth/callback/github`,
  scope: 'user:email',
  authUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userInfoUrl: 'https://api.github.com/user',
  userEmailUrl: 'https://api.github.com/user/emails',
} as const;

// Discord OAuth configuration
export const DISCORD_AUTH_CONFIG = {
  clientId: ENV.DISCORD_CLIENT_ID,
  clientSecret: ENV.DISCORD_CLIENT_SECRET,
  redirectUri: `${ENV.NEXTAUTH_URL}/api/auth/callback/discord`,
  scope: 'identify email',
  authUrl: 'https://discord.com/api/oauth2/authorize',
  tokenUrl: 'https://discord.com/api/oauth2/token',
  userInfoUrl: 'https://discord.com/api/users/@me',
} as const;