// Main authentication module exports
// This file serves as the single entry point for all auth functionality

// Type exports
export type {
  GoogleUser,
  GitHubUser,
  DiscordUser,
  GitHubEmail,
  JWTPayload,
  LinkingTokenData,
  AuthProvider,
} from './types';

// Configuration exports
export {
  GOOGLE_AUTH_CONFIG,
  GITHUB_AUTH_CONFIG,
  DISCORD_AUTH_CONFIG,
} from './config';

// Google OAuth exports
export {
  getGoogleAuthUrl,
  exchangeCodeForToken,
  getGoogleUserInfo,
} from './google';

// GitHub OAuth exports
export {
  getGitHubAuthUrl,
  exchangeGitHubCodeForToken,
  getGitHubUserInfo,
} from './github';

// Discord OAuth exports
export {
  getDiscordAuthUrl,
  exchangeCodeForToken as exchangeDiscordCodeForToken,
  getDiscordUserInfo,
} from './discord';

// Database operations exports
export {
  findUserByEmail,
  createOrUpdateUser,
  createOrUpdateGitHubUser,
  createOrUpdateDiscordUser,
  getCurrentUser,
} from './database';

// JWT operations exports
export {
  generateSessionToken,
  verifySessionToken,
} from './jwt';

// Account linking exports
export {
  generateLinkingToken,
  verifyLinkingToken,
  linkProviderToUser,
} from './linking';