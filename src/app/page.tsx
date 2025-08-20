// src/app/page.tsx
import { redirect } from 'next/navigation';
 
export default async function RootPage() {
  // Always redirect to the main welcome/login page.
  // The middleware will handle auth-based routing from there.
  return redirect('/accueil');
}
