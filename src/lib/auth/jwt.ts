import jwt from 'jsonwebtoken';
import type { JWTPayload } from './types';
import { ENV } from './config';

// Generate JWT session token
export function generateSessionToken(userId: string): string {
  console.log('🔑 [AUTH] Generating session token for userId:', userId);
  const token = jwt.sign(
    { userId, iat: Date.now() },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );
  console.log('✅ [AUTH] Session token generated successfully');
  return token;
}

// Verify JWT session token
export function verifySessionToken(token: string): { userId: string } | null {
  console.log('🔍 [AUTH] verifySessionToken called with token:', token ? 'TOKEN_EXISTS' : 'NO_TOKEN');
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
    console.log('✅ [AUTH] Token verified successfully for userId:', decoded.userId);
    return { userId: decoded.userId };
  } catch (error) {
    console.log('❌ [AUTH] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}