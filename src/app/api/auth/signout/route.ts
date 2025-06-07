import { NextResponse } from 'next/server';
import { ENV } from '@/lib/auth/config';

// POST /api/auth/signout - Sign out user
export async function POST() {
  console.log('🚀 [API] /api/auth/signout endpoint called');
  try {
    console.log('🔄 [API] Creating JSON response - letting client handle navigation to home page');
    const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
    
    console.log('🍪 [API] Clearing session cookie');
    // Clear the session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: ENV.IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    console.log('✅ [API] Session cookie cleared successfully');
    return response;
  } catch (error) {
    console.error('❌ [API] Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}

// GET /api/auth/signout - Alternative GET method for sign out
export async function GET() {
  return POST();
}