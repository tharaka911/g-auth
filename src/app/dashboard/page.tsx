'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Welcome to your Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              You have successfully signed in with Google!
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Information from your Google account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || 'Profile'}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">User ID: {user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OAuth Flow Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>How the Authentication Flow Worked</CardTitle>
            <CardDescription>
              Understanding the manual Google OAuth implementation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                <strong>Authorization Request:</strong> You clicked &ldquo;Sign in with Google&rdquo; and were redirected to Google&apos;s authorization server
              </li>
              <li>
                <strong>User Consent:</strong> Google showed you the consent screen to authorize our application
              </li>
              <li>
                <strong>Authorization Code:</strong> Google redirected back to our app with an authorization code
              </li>
              <li>
                <strong>Token Exchange:</strong> Our server exchanged the authorization code for an access token
              </li>
              <li>
                <strong>User Information:</strong> We used the access token to fetch your profile from Google&apos;s API
              </li>
              <li>
                <strong>Database Storage:</strong> Your user information was stored/updated in our PostgreSQL database
              </li>
              <li>
                <strong>Session Creation:</strong> A JWT session token was generated and stored as an HTTP-only cookie
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
          
          <Button asChild>
            <Link href="/" className="no-underline">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}