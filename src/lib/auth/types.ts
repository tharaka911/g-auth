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

// Discord user response
export interface DiscordUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
  verified: boolean;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  iat: number;
}

// Account linking token data
export interface LinkingTokenData {
  email: string;
  provider: 'google' | 'github' | 'discord';
  providerUser: GoogleUser | GitHubUser | DiscordUser;
  existingUserId: string;
  timestamp: number;
}

// Provider types
export type AuthProvider = 'google' | 'github' | 'discord';