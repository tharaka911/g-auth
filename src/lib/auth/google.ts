import { GOOGLE_AUTH_CONFIG } from './config';
import type { GoogleUser } from './types';

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
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUser> {
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