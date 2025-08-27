// src/app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          Welcome to SimplePage
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground">
          This is a simple, elegant page built with Next.js and Tailwind CSS. The purpose is to demonstrate a clean and responsive layout with a calming color palette of soft sky blue and serene light blue tones.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link href="/login">Accéder à l'application</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
