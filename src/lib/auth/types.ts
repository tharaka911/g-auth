// Type definitions for authentication system

// GitHub email response
export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

// GitHub user response
export interface GitHubUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  login: string;
}

// Google user response
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  iat: number;
}

// Account linking token data
export interface LinkingTokenData {
  email: string;
  provider: 'google' | 'github';
  providerUser: GoogleUser | GitHubUser;
  existingUserId: string;
  timestamp: number;
}

// Provider types
export type AuthProvider = 'google' | 'github';