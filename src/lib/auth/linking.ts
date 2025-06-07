import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import type { LinkingTokenData, GoogleUser, GitHubUser, AuthProvider } from './types';

// Generate linking token for account linking flow
export function generateLinkingToken(data: Omit<LinkingTokenData, 'timestamp'>): string {
  console.log('🔗 [AUTH] Generating linking token for email:', data.email);
  const tokenData: LinkingTokenData = {
    ...data,
    timestamp: Date.now(),
  };
  
  const token = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: '10m' });
  console.log('✅ [AUTH] Linking token generated successfully');
  return token;
}

// Verify and decode linking token
export function verifyLinkingToken(token: string): LinkingTokenData | null {
  console.log('🔍 [AUTH] Verifying linking token');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as LinkingTokenData;
    console.log('✅ [AUTH] Linking token verified successfully for email:', decoded.email);
    return decoded;
  } catch (error) {
    console.log('❌ [AUTH] Linking token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Link provider to existing user account
export async function linkProviderToUser(
  userId: string, 
  provider: AuthProvider, 
  providerId: string, 
  providerData: GoogleUser | GitHubUser
) {
  console.log(`🔗 [AUTH] Linking ${provider} account to user:`, userId);
  
  const updateData: {
    googleId?: string;
    githubId?: string;
    name: string;
    image: string;
    linkedProviders?: { push: string };
  } = {
    name: providerData.name, // Update name in case it's different
    image: providerData.picture, // Update image to latest
  };

  // Set the appropriate provider ID
  if (provider === 'google') {
    updateData.googleId = providerId;
  } else {
    updateData.githubId = providerId;
  }

  // Add to linkedProviders array if not already present
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { linkedProviders: true }
  });

  if (existingUser && !existingUser.linkedProviders.includes(provider)) {
    updateData.linkedProviders = {
      push: provider
    };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  console.log(`✅ [AUTH] Successfully linked ${provider} account to user:`, user.email);
  return user;
}