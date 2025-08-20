// src/app/page.tsx
import { redirect } from 'next/navigation';
 
export default async function RootPage() {
  // Redirige toujours vers la page d'accueil principale.
  // Le middleware s'occupera du routage basé sur l'authentification à partir de là.
  return redirect('/accueil');
}
