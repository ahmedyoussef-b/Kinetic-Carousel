// src/app/(dashboard)/list/chatroom/session/layout.tsx

// Ce layout crée un environnement en plein écran pour la session,
// sans la barre de menu latérale, pour une expérience immersive.

export default function SessionPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
