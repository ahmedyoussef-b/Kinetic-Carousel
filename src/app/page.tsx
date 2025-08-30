// src/app/page.tsx
import { redirect } from 'next/navigation';

// Cette page sert uniquement de point d'entrée pour rediriger vers la page de connexion.
// La logique d'authentification se chargera ensuite de rediriger les utilisateurs connectés
// vers leur tableau de bord respectif.
export default function RootPage() {
  redirect('/login');
}
