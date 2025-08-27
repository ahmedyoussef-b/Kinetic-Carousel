// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/features/auth/authSlice';
import { useRouter } from 'next/navigation';
 
export default function RootPage() {
  const [greeting, setGreeting] = useState('');
  const [name, setName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(true);
  const { toast } = useToast();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);
  const router = useRouter();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!isAuthLoading && currentUser?.role) {
      router.replace(`/${currentUser.role.toLowerCase()}`);
    }
  }, [currentUser, isAuthLoading, router]);

  // Load name from localStorage or currentUser
  useEffect(() => {
    const storedName = localStorage.getItem('accueilZenName');
    if (storedName) {
      setName(storedName);
    } else if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  // Generate greeting on the client-side
  useEffect(() => {
    if (isAuthLoading || currentUser) return; // Don't generate if loading or logged in

    const getBaseGreeting = (): string => {
      const hour = new Date().getHours();
      if (hour < 5) return 'Bonne nuit';
      if (hour < 18) return 'Bonjour';
      return 'Bonsoir';
    };

    const fetchGreeting = async () => {
      setIsLoadingGreeting(true);
      const baseGreeting = getBaseGreeting();
      
      try {
        const personalizedGreeting = await generateGreeting({ name: name || 'Visiteur', baseGreeting });
        setGreeting(personalizedGreeting);
      } catch (error) {
        console.error("Failed to fetch personalized greeting:", error);
        setGreeting(`${baseGreeting}, ${name || 'Visiteur'} !`);
      }
      setIsLoadingGreeting(false);
    };

    fetchGreeting();
  }, [name, isAuthLoading, currentUser]);

  const handleNameSave = () => {
    if (name.trim()) {
      localStorage.setItem('accueilZenName', name.trim());
      setIsEditingName(false);
      toast({
        title: 'Nom enregistré !',
        description: `Nous nous souviendrons de vous, ${name.trim()}.`,
      });
    }
  };
  
  // Show a loading screen while checking auth or redirecting
  if (isAuthLoading || currentUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  // Show the public homepage
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground font-alegreya p-4">
      <div className="absolute top-4 right-4">
        <Button asChild variant="outline">
            <Link href="/login">
                 <LogIn className="mr-2 h-4 w-4" />
                Se connecter
            </Link>
        </Button>
      </div>

      <div className="text-center animate-fade-in-slow">
        {isLoadingGreeting ? (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <h1 className="font-belleza text-5xl md:text-7xl lg:text-8xl tracking-wider text-primary animate-subtle-pulse">
            {greeting}
          </h1>
        )}

        <div className="mt-8">
          {isEditingName ? (
            <Card className="max-w-sm mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="font-alegreya">Comment devrions-nous vous appeler ?</CardTitle>
                <CardDescription>Entrez votre nom pour une touche personnelle.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Entrez votre nom..."
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="bg-background/80"
                />
                <Button onClick={handleNameSave}>Enregistrer</Button>
              </CardContent>
            </Card>
          ) : (
            <Button variant="ghost" onClick={() => setIsEditingName(true)} className="text-muted-foreground hover:text-primary">
                {name ? `Ce n'est pas ${name} ?` : 'Personnaliser le message'}
            </Button>
          )}
        </div>
      </div>

       <footer className="absolute bottom-4 text-xs text-muted-foreground/50">
            Propulsé par <Sparkles className="inline-block h-3 w-3 text-accent" /> Genkit AI
       </footer>
    </main>
  );
}