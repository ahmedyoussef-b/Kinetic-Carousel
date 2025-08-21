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
  console.log("👑 [AdminPageClient] Le composant est en cours de rendu.");
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    console.log(`👑 [AdminPageClient] L'état d'authentification a changé : isLoading=${isLoading}, user=${!!user}`);
    // Wait until the auth state is fully loaded
    if (!isLoading) {
      // If loading is finished and there's no user or the user is not an admin, redirect
      if (!user || user.role !== Role.ADMIN) {
        console.warn("👑 [AdminPageClient] Accès refusé ou session invalide. Redirection vers la page de connexion...");
        router.replace('/login');
      } else {
        console.log("👑 [AdminPageClient] Accès autorisé. Affichage du tableau de bord administrateur.");
      }
    }
  }, [user, isLoading, router]);

  // While checking the session, show a loading spinner
  if (isLoading || !user) {
    console.log("👑 [AdminPageClient] Affichage du spinner de chargement en attendant l'authentification.");
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If we have a user and they are an admin, render the dashboard
  if (user.role === Role.ADMIN) {
    console.log("👑 [AdminPageClient] Utilisateur administrateur confirmé. Rendu du contenu.");
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
