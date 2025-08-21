// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  console.log("🔄 [DashboardRedirectPage] Le composant est en cours de rendu.");
  const router = useRouter();
  const currentUser = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    console.log(`[DashboardRedirectPage] useEffect a été déclenché. isLoading: ${isLoading}, currentUser: ${!!currentUser}`);
    // Only redirect when authentication state is definitively known
    if (!isLoading) {
      if (currentUser?.role) {
        const targetPath = `/${currentUser.role.toLowerCase()}`;
        console.log(`[DashboardRedirectPage] Redirection vers le tableau de bord du rôle: ${targetPath}`);
        router.replace(targetPath);
      } else {
        // If loading is done and there's still no user, redirect to login
        console.log("[DashboardRedirectPage] Aucun utilisateur trouvé après le chargement, redirection vers la page de connexion.");
        router.replace('/login');
      }
    }
  }, [currentUser, isLoading, router]);

  // Always show a loading spinner while determining the redirect path
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirection en cours...</p>
    </main>
  );
}
