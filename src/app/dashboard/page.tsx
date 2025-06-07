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