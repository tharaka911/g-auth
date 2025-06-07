import { DISCORD_AUTH_CONFIG } from './config';
import type { DiscordUser } from './types';

// Generate Discord OAuth authorization URL
export function getDiscordAuthUrl(): string {
  console.log('🔗 [AUTH] Generating Discord OAuth URL...');
  const params = new URLSearchParams({
    client_id: DISCORD_AUTH_CONFIG.clientId,
    redirect_uri: DISCORD_AUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: DISCORD_AUTH_CONFIG.scope,
  });

  const authUrl = `${DISCORD_AUTH_CONFIG.authUrl}?${params.toString()}`;
  console.log('✅ [AUTH] Discord OAuth URL generated:', authUrl);
  return authUrl;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string) {
  console.log('🔄 [AUTH] Exchanging authorization code for access token...');
  const response = await fetch(DISCORD_AUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: DISCORD_AUTH_CONFIG.clientId,
      client_secret: DISCORD_AUTH_CONFIG.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_AUTH_CONFIG.redirectUri,
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

// Get user info from Discord using access token
export async function getDiscordUserInfo(accessToken: string): Promise<DiscordUser> {
  console.log('🔄 [AUTH] Fetching user info from Discord...');
  const response = await fetch(DISCORD_AUTH_CONFIG.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('❌ [AUTH] Failed to fetch user info:', response.status, response.statusText);
    throw new Error('Failed to fetch user info');
  }

  const userInfo = await response.json();
  
  // Transform Discord user data to match our interface
  const discordUser: DiscordUser = {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.global_name || userInfo.username || 'Discord User',
    picture: userInfo.avatar
      ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(userInfo.discriminator || '0') % 5}.png`,
    username: userInfo.username || 'unknown',
    global_name: userInfo.global_name,
    avatar: userInfo.avatar,
    discriminator: userInfo.discriminator || '0',
    verified: userInfo.verified || false,
  };

  console.log('✅ [AUTH] Successfully fetched user info from Discord:', {
    id: discordUser.id,
    email: discordUser.email,
    name: discordUser.name
  });
  
  return discordUser;
}