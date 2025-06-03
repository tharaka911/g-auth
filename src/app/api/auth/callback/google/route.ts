import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getGoogleUserInfo, createOrUpdateUser, generateSessionToken } from '@/lib/auth';

// GET /api/auth/callback/google - Handle Google OAuth callback
export async function GET(request: NextRequest) {
  console.log('🚀 [API] /api/auth/callback/google endpoint called');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('📋 [API] OAuth callback params:', {
    hasCode: !!code,
    error: error || 'none'
  });

  // Handle OAuth errors
  if (error) {
    console.error('❌ [API] OAuth error received:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=oauth_error`);
  }

  // Missing authorization code
  if (!code) {
    console.error('❌ [API] No authorization code received from Google');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=missing_code`);
  }

  try {
    // Step 1: Exchange authorization code for access token
    console.log('🔄 [API] Step 1: Exchanging authorization code for access token...');
    const tokenResponse = await exchangeCodeForToken(code);
    
    if (!tokenResponse.access_token) {
      throw new Error('No access token received from Google');
    }
    console.log('✅ [API] Step 1: Access token received successfully');

    // Step 2: Get user info from Google
    console.log('🔄 [API] Step 2: Fetching user info from Google...');
    const googleUser = await getGoogleUserInfo(tokenResponse.access_token);
    
    console.log('✅ [API] Step 2: Google user info received:', {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name
    });

    // Step 3: Create or update user in database
    console.log('🔄 [API] Step 3: Creating/updating user in database...');
    const user = await createOrUpdateUser(googleUser);
    console.log('✅ [API] Step 3: User created/updated in database:', {
      id: user.id,
      email: user.email
    });

    // Step 4: Generate session token
    console.log('🔄 [API] Step 4: Generating JWT session token...');
    const sessionToken = generateSessionToken(user.id);
    console.log('✅ [API] Step 4: JWT session token generated');

    // Step 5: Set session cookie and redirect to dashboard
    console.log('🔄 [API] Step 5: Setting session cookie and redirecting...');
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
    
    // Set secure HTTP-only cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('🎉 [API] Authentication successful for user:', user.email);
    console.log('🔄 [API] Redirecting to dashboard...');
    return response;

  } catch (error) {
    console.error('❌ [API] Authentication error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=authentication_failed`
    );
  }
}