import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl, getGitHubAuthUrl } from '@/lib/auth';

// GET /api/auth/signin - Redirect to OAuth provider
export async function GET(request: NextRequest) {
  console.log('🚀 [API] /api/auth/signin endpoint called');
  
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'google';
  
  console.log('📋 [API] Sign-in requested for provider:', provider);
  
  try {
    let authUrl: string;
    
    if (provider === 'github') {
      console.log('🔗 [API] Generating GitHub OAuth URL...');
      authUrl = getGitHubAuthUrl();
      console.log('✅ [API] GitHub OAuth URL generated:', authUrl);
    } else if (provider === 'google') {
      console.log('🔗 [API] Generating Google OAuth URL...');
      authUrl = getGoogleAuthUrl();
      console.log('✅ [API] Google OAuth URL generated:', authUrl);
    } else {
      console.error('❌ [API] Unsupported provider:', provider);
      return NextResponse.json(
        { error: 'Unsupported authentication provider' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 [API] Redirecting to ${provider} OAuth authorization page`);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error(`❌ [API] Error generating ${provider} auth URL:`, error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}