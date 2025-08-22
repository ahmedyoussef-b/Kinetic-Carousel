// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    // Redirect to the accueil page, which will handle the final role-based redirection.
    // This simplifies logic and avoids duplicating the welcome page content.
    if (currentUser) {
        router.replace(`/${currentUser.role.toLowerCase()}`);
    } else {
        // If for some reason there's no user, go back to the main entry point.
        router.replace('/accueil');
    }
  }, [currentUser, router]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirection en cours...</p>
    </main>
  );
}
