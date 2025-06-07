import { prisma } from '../prisma';
import type { GoogleUser, GitHubUser, DiscordUser } from './types';

// Find user by email (for account linking detection)
export async function findUserByEmail(email: string) {
  console.log('🔍 [AUTH] Looking up user by email:', email);
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      googleId: true,
      githubId: true,
      discordId: true,
      primaryProvider: true,
      linkedProviders: true,
      name: true,
      image: true,
    },
  });
  
  console.log('👤 [AUTH] User lookup result:', user ? `Found: ${user.email}` : 'Not found');
  return user;
}

// Create or update user in database with Google info
export async function createOrUpdateUser(googleUser: GoogleUser) {
  console.log('🔄 [AUTH] Creating/updating Google user in database for email:', googleUser.email);
  const user = await prisma.user.upsert({
    where: { email: googleUser.email },
    update: {
      name: googleUser.name,
      image: googleUser.picture,
      googleId: googleUser.id,
      linkedProviders: {
        set: ['google'] // This will be enhanced later for multi-provider support
      }
    },
    create: {
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
      googleId: googleUser.id,
      primaryProvider: 'google',
      linkedProviders: ['google'],
    },
  });

  console.log('✅ [AUTH] Google user created/updated successfully:', {
    id: user.id,
    email: user.email,
    isNew: user.createdAt === user.updatedAt
  });
  return user;
}

// Create or update user with GitHub info
export async function createOrUpdateGitHubUser(githubUser: GitHubUser) {
  console.log('🔄 [AUTH] Creating/updating GitHub user in database for email:', githubUser.email);
  const user = await prisma.user.upsert({
    where: { email: githubUser.email },
    update: {
      name: githubUser.name,
      image: githubUser.picture,
      githubId: githubUser.id,
      linkedProviders: {
        set: ['github'] // This will be enhanced later for multi-provider support
      }
    },
    create: {
      email: githubUser.email,
      name: githubUser.name,
      image: githubUser.picture,
      githubId: githubUser.id,
      primaryProvider: 'github',
      linkedProviders: ['github'],
    },
  });

  console.log('✅ [AUTH] GitHub user created/updated successfully:', {
    id: user.id,
    email: user.email,
    isNew: user.createdAt === user.updatedAt
  });
  return user;
}

// Create or update user with Discord info
export async function createOrUpdateDiscordUser(discordUser: DiscordUser) {
  console.log('🔄 [AUTH] Creating/updating Discord user in database for email:', discordUser.email);
  const user = await prisma.user.upsert({
    where: { email: discordUser.email },
    update: {
      name: discordUser.name,
      image: discordUser.picture,
      discordId: discordUser.id,
      linkedProviders: {
        set: ['discord'] // This will be enhanced later for multi-provider support
      }
    },
    create: {
      email: discordUser.email,
      name: discordUser.name,
      image: discordUser.picture,
      discordId: discordUser.id,
      primaryProvider: 'discord',
      linkedProviders: ['discord'],
    },
  });

  console.log('✅ [AUTH] Discord user created/updated successfully:', {
    id: user.id,
    email: user.email,
    isNew: user.createdAt === user.updatedAt
  });
  return user;
}

// Get current user from session token
export async function getCurrentUser(sessionToken?: string) {
  console.log('👤 [AUTH] getCurrentUser called with sessionToken:', sessionToken ? 'TOKEN_EXISTS' : 'NO_TOKEN');
  
  if (!sessionToken) {
    console.log('❌ [AUTH] No session token provided');
    return null;
  }

  // Import here to avoid circular dependency
  const { verifySessionToken } = await import('./jwt');
  
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