import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// GET /api/auth/me - Get current user information
export async function GET(request: NextRequest) {
  console.log('🚀 [API] /api/auth/me endpoint called');
  try {
    const sessionToken = request.cookies.get('session')?.value;
    console.log('🍪 [API] Session cookie:', sessionToken ? 'EXISTS' : 'NOT_FOUND');
    
    if (!sessionToken) {
      console.log('❌ [API] No session token found in cookies');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    console.log('🔄 [API] Calling getCurrentUser...');
    const user = await getCurrentUser(sessionToken);
    console.log('✅ [API] getCurrentUser result:', user ? `Found user: ${user.email}` : 'No user found');
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('❌ [API] Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    );
  }
}