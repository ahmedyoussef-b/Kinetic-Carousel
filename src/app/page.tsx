// src/app/page.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4" style={{ color: 'hsl(var(--primary))' }}>
          Bienvenue sur SimplePage
        </h1>
        <p className="text-lg mb-8" style={{ color: 'hsl(var(--foreground))' }}>
          Une page simple et sereine pour commencer votre projet.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Commencer</Link>
        </Button>
      </div>
    </main>
  );
}
