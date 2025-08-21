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
    // La logique de redirection a été supprimée.
    // Le middleware gère désormais la protection des routes de manière centralisée.
    // Ce composant se concentre uniquement sur l'affichage du contenu pour un administrateur déjà authentifié.
    if (!isLoading && !user) {
        // Si l'état de chargement est terminé et qu'il n'y a pas d'utilisateur,
        // cela peut indiquer une session expirée. Le middleware devrait déjà avoir redirigé,
        // mais une redirection côté client peut servir de filet de sécurité.
        router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Pendant la vérification de la session, afficher un spinner de chargement
  if (isLoading || !user) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si nous avons un utilisateur et qu'il est administrateur, afficher le tableau de bord
  if (user.role === Role.ADMIN) {
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader />
        {children} 
      </div>
    );
  }

  // Ce cas ne devrait être atteint que si un utilisateur non-admin accède à cette page,
  // ce que le middleware devrait empêcher. Retourner null pour éviter tout rendu incorrect.
  return null;
}
