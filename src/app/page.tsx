// src/app/page.tsx
import React from 'react';

export default function SimplePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background font-sans">
      <main className="text-center p-8">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Welcome to SimplePage
        </h1>
        <p className="text-lg text-foreground max-w-xl">
          This is a simple, elegant page built with Next.js and Tailwind CSS. The purpose is to demonstrate a clean and responsive layout with a calming color palette.
        </p>
      </main>
    </div>
  );
}
