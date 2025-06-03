import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/auth';

// GET /api/auth/signin - Redirect to Google OAuth
export async function GET() {
  console.log('🚀 [API] /api/auth/signin endpoint called');
  try {
    console.log('🔗 [API] Generating Google OAuth URL...');
    const authUrl = getGoogleAuthUrl();
    console.log('✅ [API] Google OAuth URL generated:', authUrl);
    
    console.log('🔄 [API] Redirecting to Google OAuth authorization page');
    // Redirect to Google OAuth authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('❌ [API] Error generating Google auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}