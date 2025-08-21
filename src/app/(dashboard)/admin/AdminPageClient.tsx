// src/components/dashboard/admin/AdminPageClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/features/auth/authSlice';
import { Role } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import AdminHeader from '@/components/dashboard/admin/AdminHeader';

export default function AdminPageClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    // Wait until the auth state is fully loaded
    if (!isLoading) {
      // If loading is finished and there's no user or the user is not an admin, redirect
      if (!user || user.role !== Role.ADMIN) {
        // This redirection is now handled by the middleware, but we keep it as a fallback.
        // The primary purpose of this component is now to show a loading state and render the layout.
        // NOTE: The primary redirection logic has been removed to prevent race conditions with the middleware.
      }
    }
  }, [user, isLoading, router]);

  // While checking the session, show a loading spinner
  if (isLoading || !user) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If we have a user and they are an admin, render the dashboard
  if (user.role === Role.ADMIN) {
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader />
        {children} 
      </div>
    );
  }

  // Fallback for the brief moment before redirection if logic fails
  return null;
}
