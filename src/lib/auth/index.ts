// Main authentication module exports
// This file serves as the single entry point for all auth functionality

// Type exports
export type {
  GoogleUser,
  GitHubUser,
  GitHubEmail,
  JWTPayload,
  LinkingTokenData,
  AuthProvider,
} from './types';

// Configuration exports
export {
  GOOGLE_AUTH_CONFIG,
  GITHUB_AUTH_CONFIG,
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

// Database operations exports
export {
  findUserByEmail,
  createOrUpdateUser,
  createOrUpdateGitHubUser,
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