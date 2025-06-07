import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/auth/config';
import { exchangeGitHubCodeForToken, getGitHubUserInfo, createOrUpdateGitHubUser, generateSessionToken, findUserByEmail, generateLinkingToken } from '@/lib/auth';

// GET /api/auth/callback/github - Handle GitHub OAuth callback
export async function GET(request: NextRequest) {
  console.log('🚀 [API] /api/auth/callback/github endpoint called');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('📋 [API] GitHub OAuth callback params:', {
    hasCode: !!code,
    error: error || 'none'
  });

  // Handle OAuth errors
  if (error) {
    console.error('❌ [API] GitHub OAuth error received:', error);
    return NextResponse.redirect(`${ENV.NEXTAUTH_URL}/?error=oauth_error`);
  }

  // Missing authorization code
  if (!code) {
    console.error('❌ [API] No authorization code received from GitHub');
    return NextResponse.redirect(`${ENV.NEXTAUTH_URL}/?error=missing_code`);
  }

  try {
    // Step 1: Exchange authorization code for access token
    console.log('🔄 [API] Step 1: Exchanging GitHub authorization code for access token...');
    const tokenResponse = await exchangeGitHubCodeForToken(code);
    
    if (!tokenResponse.access_token) {
      throw new Error('No access token received from GitHub');
    }
    console.log('✅ [API] Step 1: GitHub access token received successfully');

    // Step 2: Get user info from GitHub
    console.log('🔄 [API] Step 2: Fetching user info from GitHub...');
    const githubUser = await getGitHubUserInfo(tokenResponse.access_token);
    
    if (!githubUser.email) {
      console.error('❌ [API] No email received from GitHub');
      return NextResponse.redirect(`${ENV.NEXTAUTH_URL}/?error=no_email`);
    }
    
    console.log('✅ [API] Step 2: GitHub user info received:', {
      id: githubUser.id,
      email: githubUser.email,
      name: githubUser.name
    });

    // Step 3: Check if user already exists with different provider
    console.log('🔄 [API] Step 3: Checking for existing user account...');
    const existingUser = await findUserByEmail(githubUser.email);
    
    if (existingUser && !existingUser.githubId) {
      // Account exists with different provider - initiate linking flow
      console.log('🔗 [API] Account found with different provider, initiating linking flow...');
      const linkingToken = generateLinkingToken({
        email: githubUser.email,
        provider: 'github',
        providerUser: githubUser,
        existingUserId: existingUser.id,
      });
      
      console.log('🔄 [API] Redirecting to account linking page...');
      return NextResponse.redirect(
        `${ENV.NEXTAUTH_URL}/auth/link-account?token=${linkingToken}`
      );
    }

    // Step 4: Create or update user in database
    console.log('🔄 [API] Step 4: Creating/updating user in database...');
    const user = await createOrUpdateGitHubUser(githubUser);
    console.log('✅ [API] Step 4: User created/updated in database:', {
      id: user.id,
      email: user.email
    });

    // Step 5: Generate session token
    console.log('🔄 [API] Step 5: Generating JWT session token...');
    const sessionToken = generateSessionToken(user.id);
    console.log('✅ [API] Step 5: JWT session token generated');

    // Step 6: Set session cookie and redirect to dashboard
    console.log('🔄 [API] Step 6: Setting session cookie and redirecting...');
    const response = NextResponse.redirect(`${ENV.NEXTAUTH_URL}/dashboard`);
    
    // Set secure HTTP-only cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: ENV.IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('🎉 [API] GitHub authentication successful for user:', user.email);
    console.log('🔄 [API] Redirecting to dashboard...');
    return response;

  } catch (error) {
    console.error('❌ [API] GitHub authentication error:', error);
    return NextResponse.redirect(
      `${ENV.NEXTAUTH_URL}/?error=authentication_failed`
    );
  }
}