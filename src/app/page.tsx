
"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { MusicalNotesLoader } from '@/components/ui/gears-loader';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const { loggedInUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Wait until authentication status is determined
    if (status !== 'loading') {
      // If there's a session or a user in our custom context, go to dashboard
      if (session || loggedInUser) {
        router.replace('/dashboard');
      } else {
        // Otherwise, go to login page
        router.replace('/login');
      }
    }
  }, [session, loggedInUser, status, router]);

  // Show a loading state while we check for an active session.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <MusicalNotesLoader size="lg" />
          <p className="text-muted-foreground">Loading Beatif...</p>
        </div>
      </div>
  );
}
