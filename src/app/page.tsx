// src/app/page.tsx
import { redirect } from 'next/navigation';

// Cette page sert uniquement de point d'entrée pour rediriger vers le tableau de bord.
// Le tableau de bord gère ensuite la logique pour rediriger vers la page de connexion si nécessaire.
// C'est la méthode la plus propre et la plus performante recommandée par Next.js.
export default function RootPage() {
  redirect('/dashboard');
}
