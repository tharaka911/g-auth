import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

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

// Generate Google OAuth authorization URL
export function getGoogleAuthUrl(): string {
  console.log('🔗 [AUTH] Generating Google OAuth URL...');
  const params = new URLSearchParams({
    client_id: GOOGLE_AUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_AUTH_CONFIG.redirectUri,
    scope: GOOGLE_AUTH_CONFIG.scope,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  });

  const authUrl = `${GOOGLE_AUTH_CONFIG.authUrl}?${params.toString()}`;
  console.log('✅ [AUTH] Google OAuth URL generated:', authUrl);
  return authUrl;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string) {
  console.log('🔄 [AUTH] Exchanging authorization code for access token...');
  const response = await fetch(GOOGLE_AUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_AUTH_CONFIG.clientId,
      client_secret: GOOGLE_AUTH_CONFIG.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_AUTH_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) {
    console.error('❌ [AUTH] Failed to exchange code for token:', response.status, response.statusText);
    throw new Error('Failed to exchange code for token');
  }

  const tokenData = await response.json();
  console.log('✅ [AUTH] Successfully exchanged code for access token');
  return tokenData;
}

// Get user info from Google using access token
export async function getGoogleUserInfo(accessToken: string) {
  console.log('🔄 [AUTH] Fetching user info from Google...');
  const response = await fetch(`${GOOGLE_AUTH_CONFIG.userInfoUrl}?access_token=${accessToken}`);

  if (!response.ok) {
    console.error('❌ [AUTH] Failed to fetch user info:', response.status, response.statusText);
    throw new Error('Failed to fetch user info');
  }

  const userInfo = await response.json();
  console.log('✅ [AUTH] Successfully fetched user info from Google:', {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name
  });
  return userInfo;
}

// Types for Google user response
interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// Create or update user in database
export async function createOrUpdateUser(googleUser: GoogleUser) {
  console.log('🔄 [AUTH] Creating/updating user in database for email:', googleUser.email);
  const user = await prisma.user.upsert({
    where: { email: googleUser.email },
    update: {
      name: googleUser.name,
      image: googleUser.picture,
      googleId: googleUser.id,
    },
    create: {
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
      googleId: googleUser.id,
    },
  });

  console.log('✅ [AUTH] User created/updated successfully:', {
    id: user.id,
    email: user.email,
    isNew: user.createdAt === user.updatedAt
  });
  return user;
}

// Generate JWT session token
export function generateSessionToken(userId: string): string {
  console.log('🔑 [AUTH] Generating session token for userId:', userId);
  const token = jwt.sign(
    { userId, iat: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  console.log('✅ [AUTH] Session token generated successfully');
  return token;
}

// Types for JWT payload
interface JWTPayload {
  userId: string;
  iat: number;
}

// Verify JWT session token
export function verifySessionToken(token: string): { userId: string } | null {
  console.log('🔍 [AUTH] verifySessionToken called with token:', token ? 'TOKEN_EXISTS' : 'NO_TOKEN');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    console.log('✅ [AUTH] Token verified successfully for userId:', decoded.userId);
    return { userId: decoded.userId };
  } catch (error) {
    console.log('❌ [AUTH] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Get current user from session token
export async function getCurrentUser(sessionToken?: string) {
  console.log('👤 [AUTH] getCurrentUser called with sessionToken:', sessionToken ? 'TOKEN_EXISTS' : 'NO_TOKEN');
  
  if (!sessionToken) {
    console.log('❌ [AUTH] No session token provided');
    return null;
  }

  const session = verifySessionToken(sessionToken);
  if (!session) {
    console.log('❌ [AUTH] Session verification failed');
    return null;
  }

  console.log('🔍 [AUTH] Looking up user with ID:', session.userId);
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  console.log('👤 [AUTH] User found:', user ? `${user.email} (${user.id})` : 'NOT_FOUND');
  return user;
}