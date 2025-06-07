import { NextRequest, NextResponse } from 'next/server';
import { verifyLinkingToken, linkProviderToUser, createOrUpdateGitHubUser, createOrUpdateUser, generateSessionToken } from '@/lib/auth';
import type { GitHubUser, GoogleUser } from '@/lib/auth';

// POST /api/auth/link-accounts - Handle account linking decision
export async function POST(request: NextRequest) {
  console.log('🚀 [API] /api/auth/link-accounts endpoint called');
  
  try {
    const { token, action } = await request.json();
    
    if (!token || !action) {
      console.error('❌ [API] Missing required parameters:', { token: !!token, action });
      return NextResponse.json(
        { error: 'Missing token or action parameter' },
        { status: 400 }
      );
    }

    console.log('📋 [API] Account linking action requested:', action);

    // Verify the linking token
    console.log('🔍 [API] Verifying linking token...');
    const tokenData = verifyLinkingToken(token);
    
    if (!tokenData) {
      console.error('❌ [API] Invalid or expired linking token');
      return NextResponse.json(
        { error: 'Invalid or expired linking token' },
        { status: 400 }
      );
    }

    console.log('✅ [API] Linking token verified for:', tokenData.email);

    let user;

    if (action === 'link') {
      // User chose to link accounts
      console.log('🔗 [API] Linking accounts...');
      user = await linkProviderToUser(
        tokenData.existingUserId,
        tokenData.provider,
        tokenData.providerUser.id,
        tokenData.providerUser
      );
      
      console.log('✅ [API] Accounts linked successfully');
    } else if (action === 'separate') {
      // User chose to keep accounts separate - create new account
      console.log('🆕 [API] Creating separate account...');
      
      if (tokenData.provider === 'github') {
        // Type assertion since we know this is GitHubUser when provider is 'github'
        user = await createOrUpdateGitHubUser(tokenData.providerUser as GitHubUser);
      } else {
        // Type assertion since we know this is GoogleUser when provider is 'google'
        user = await createOrUpdateUser(tokenData.providerUser as GoogleUser);
      }
      
      console.log('✅ [API] Separate account created successfully');
    } else {
      console.error('❌ [API] Invalid action:', action);
      return NextResponse.json(
        { error: 'Invalid action. Must be "link" or "separate"' },
        { status: 400 }
      );
    }

    // Generate session token
    console.log('🔑 [API] Generating session token...');
    const sessionToken = generateSessionToken(user.id);
    console.log('✅ [API] Session token generated');

    // Create response with redirect to dashboard
    console.log('🔄 [API] Creating response with session cookie...');
    const response = NextResponse.json({ 
      success: true, 
      action,
      redirectUrl: '/dashboard'
    });

    // Set secure HTTP-only cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('🎉 [API] Account linking completed successfully for:', user.email);
    return response;

  } catch (error) {
    console.error('❌ [API] Account linking error:', error);
    return NextResponse.json(
      { error: 'Failed to process account linking' },
      { status: 500 }
    );
  }
}