import { GITHUB_AUTH_CONFIG } from './config';
import type { GitHubUser, GitHubEmail } from './types';

// Generate GitHub OAuth authorization URL
export function getGitHubAuthUrl(): string {
  console.log('🔗 [AUTH] Generating GitHub OAuth URL...');
  const params = new URLSearchParams({
    client_id: GITHUB_AUTH_CONFIG.clientId,
    redirect_uri: GITHUB_AUTH_CONFIG.redirectUri,
    scope: GITHUB_AUTH_CONFIG.scope,
    response_type: 'code',
    access_type: 'offline',
  });

  const authUrl = `${GITHUB_AUTH_CONFIG.authUrl}?${params.toString()}`;
  console.log('✅ [AUTH] GitHub OAuth URL generated:', authUrl);
  return authUrl;
}

// Exchange authorization code for GitHub access token
export async function exchangeGitHubCodeForToken(code: string) {
  console.log('🔄 [AUTH] Exchanging GitHub authorization code for access token...');
  const response = await fetch(GITHUB_AUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GITHUB_AUTH_CONFIG.clientId,
      client_secret: GITHUB_AUTH_CONFIG.clientSecret,
      code,
      redirect_uri: GITHUB_AUTH_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) {
    console.error('❌ [AUTH] Failed to exchange GitHub code for token:', response.status, response.statusText);
    throw new Error('Failed to exchange GitHub code for token');
  }

  const tokenData = await response.json();
  console.log('✅ [AUTH] Successfully exchanged GitHub code for access token');
  return tokenData;
}

// Get user info from GitHub using access token
export async function getGitHubUserInfo(accessToken: string): Promise<GitHubUser> {
  console.log('🔄 [AUTH] Fetching user info from GitHub...');
  
  // Get user profile
  const userResponse = await fetch(GITHUB_AUTH_CONFIG.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!userResponse.ok) {
    console.error('❌ [AUTH] Failed to fetch GitHub user info:', userResponse.status, userResponse.statusText);
    throw new Error('Failed to fetch GitHub user info');
  }

  const userInfo = await userResponse.json();
  
  // Get user emails (GitHub may not include email in profile if it's private)
  const emailResponse = await fetch(GITHUB_AUTH_CONFIG.userEmailUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  let primaryEmail = userInfo.email;
  if (!primaryEmail && emailResponse.ok) {
    const emails: GitHubEmail[] = await emailResponse.json();
    const primaryEmailObj = emails.find((email: GitHubEmail) => email.primary);
    primaryEmail = primaryEmailObj?.email;
  }

  const githubUserInfo: GitHubUser = {
    id: userInfo.id.toString(),
    email: primaryEmail,
    name: userInfo.name || userInfo.login,
    picture: userInfo.avatar_url,
    login: userInfo.login,
  };

  console.log('✅ [AUTH] Successfully fetched user info from GitHub:', {
    id: githubUserInfo.id,
    email: githubUserInfo.email,
    name: githubUserInfo.name
  });
  
  return githubUserInfo;
}