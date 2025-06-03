'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    console.log('🎣 [FRONTEND] useAuth: fetchCurrentUser called');
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('📡 [FRONTEND] useAuth: Making request to /api/auth/me');
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      console.log('📡 [FRONTEND] useAuth: Response received:', { status: response.status, data });
      
      if (response.ok) {
        console.log('✅ [FRONTEND] useAuth: Setting user state:', data.user ? data.user.email : 'null');
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
      } else {
        console.log('❌ [FRONTEND] useAuth: Request failed with error:', data.error);
        setAuthState({
          user: null,
          loading: false,
          error: data.error || 'Failed to fetch user',
        });
      }
    } catch (error) {
      console.error('❌ [FRONTEND] useAuth: Network error fetching current user:', error);
      setAuthState({
        user: null,
        loading: false,
        error: 'Network error',
      });
    }
  };

  const signIn = () => {
    console.log('🚪 [FRONTEND] useAuth: signIn called - redirecting to /api/auth/signin');
    // Redirect to Google OAuth
    window.location.href = '/api/auth/signin';
  };

  const signOut = async () => {
    console.log('🚪 [FRONTEND] useAuth: signOut called');
    try {
      console.log('📡 [FRONTEND] useAuth: Making request to /api/auth/signout');
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('✅ [FRONTEND] useAuth: Signout successful, clearing state');
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
        console.log('🔄 [FRONTEND] useAuth: Redirecting to home page');
        // Redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('❌ [FRONTEND] useAuth: Error signing out:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to sign out',
      }));
    }
  };

  return {
    ...authState,
    signIn,
    signOut,
    refetch: fetchCurrentUser,
  };
}