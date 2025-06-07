'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LinkingData {
  email: string;
  provider: 'google' | 'github' | 'discord';
  existingProvider: string;
  existingProviders: string[];
  providerUser: {
    name: string;
    picture: string;
  };
}

function LinkAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [linkingData, setLinkingData] = useState<LinkingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing linking token');
      setLoading(false);
      return;
    }

    // Decode token to get linking information (client-side safe decoding)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      console.log('🔍 [FRONTEND] Decoded token data:', decoded);
      
      // Helper function to format provider name for display
      const formatProviderName = (provider: string) => {
        return provider.charAt(0).toUpperCase() + provider.slice(1);
      };
      
      // Determine existing provider display name
      let existingProviderDisplay = '';
      if (decoded.existingUserProvider) {
        existingProviderDisplay = formatProviderName(decoded.existingUserProvider);
      } else if (decoded.existingUserLinkedProviders && decoded.existingUserLinkedProviders.length > 0) {
        existingProviderDisplay = decoded.existingUserLinkedProviders.map(formatProviderName).join('/');
      } else {
        // Fallback to old hardcoded logic if new data is not available
        existingProviderDisplay = decoded.provider === 'github' ? 'Google' : decoded.provider === 'discord' ? 'Google/GitHub' : 'GitHub';
      }
      
      setLinkingData({
        email: decoded.email,
        provider: decoded.provider,
        existingProvider: existingProviderDisplay,
        existingProviders: decoded.existingUserLinkedProviders || [],
        providerUser: decoded.providerUser,
      });
    } catch (err) {
      console.error('Failed to decode token:', err);
      setError('Invalid linking token');
    }
    
    setLoading(false);
  }, [token]);

  const handleLinkAccounts = async () => {
    if (!token) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/link-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action: 'link' }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to link accounts');
      }
    } catch (err) {
      console.error('Linking error:', err);
      setError('Failed to link accounts');
    }
    
    setProcessing(false);
  };

  const handleKeepSeparate = async () => {
    if (!token) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/link-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action: 'separate' }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to create separate account');
      }
    } catch (err) {
      console.error('Separate account error:', err);
      setError('Failed to create separate account');
    }
    
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !linkingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error || 'Invalid request'}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const providerName = linkingData.provider === 'github' ? 'GitHub' : linkingData.provider === 'discord' ? 'Discord' : 'Google';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Account Found</CardTitle>
          <CardDescription>
            We found an existing account with this email address
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
              {linkingData.providerUser.picture && linkingData.providerUser.picture.trim() !== '' ? (
                <Image
                  src={linkingData.providerUser.picture}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xl font-semibold">
                    {linkingData.providerUser.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
            <div>
              <p className="font-medium">{linkingData.providerUser.name}</p>
              <p className="text-sm text-muted-foreground">{linkingData.email}</p>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-foreground">
                An account already exists with <strong>{linkingData.email}</strong> using{' '}
                <strong>{linkingData.existingProvider}</strong>.
              </p>
              <p className="text-sm text-foreground mt-2">
                Would you like to link your <strong>{providerName}</strong> account to your existing{' '}
                <strong>{linkingData.existingProvider}</strong> account?
              </p>
            </div>
          </div>
        </CardContent>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-3 px-6 pb-6">
          <Button 
            onClick={handleLinkAccounts}
            disabled={processing}
            className="w-full"
          >
            {processing ? 'Linking...' : `Yes, Link Accounts`}
          </Button>
          
          <Button 
            onClick={handleKeepSeparate}
            disabled={processing}
            variant="outline"
            className="w-full"
          >
            {processing ? 'Creating...' : 'No, Keep Separate'}
          </Button>
        </div>
        
        <div className="text-center pb-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel and go home
          </button>
        </div>
      </Card>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function LinkAccountPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LinkAccountContent />
    </Suspense>
  );
}