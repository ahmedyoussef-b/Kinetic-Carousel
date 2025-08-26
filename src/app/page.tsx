// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/features/auth/authSlice';
import { Spinner } from '@/components/ui/spinner';

export default function RootPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    // This effect will run on the client side after hydration.
    // The middleware should have already redirected, but this is a fallback.
    if (!isLoading) {
      if (user?.role) {
        console.log(`[RootPage] User authenticated. Redirecting to /${user.role.toLowerCase()}`);
        router.replace(`/${user.role.toLowerCase()}`);
      } else {
        console.log('[RootPage] User not authenticated. Redirecting to /accueil.');
        router.replace('/accueil');
      }
    }
  }, [user, isLoading, router]);
  
  // Show a loading indicator while the session is being checked.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
