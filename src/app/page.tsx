// src/app/page.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-primary">
          Bienvenue sur SimplePage
        </h1>
        <p className="text-lg text-foreground mb-8">
          Une page simple et sereine pour commencer votre projet.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Commencer</Link>
        </Button>
      </div>
    </main>
  );
}
