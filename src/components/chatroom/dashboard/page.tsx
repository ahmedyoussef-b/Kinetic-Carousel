
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchSessionData, startSession } from '@/lib/redux/slices/sessionSlice';
import { SessionType } from '@/lib/redux/slices/session/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Video, Users, Settings } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';

const ChatroomDashboardPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    classes,
    selectedClass,
    loading,
    meetingCandidates,
  } = useSelector((state: RootState) => state.session);

  const [isAddStudentsDialogOpen, setAddStudentsDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSessionData(user.id));
    }
  }, [dispatch, user?.id]);

  const handleClassSelect = (classId: string) => {
    // This will be handled by the slice now if we want to keep it in Redux state
    // For now, local state might suffice if it's just for this component
  };

  const handleStartSession = async (type: SessionType, classId: number | null) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous devez être connecté pour démarrer une session.',
      });
      return;
    }

    if (type === 'CLASS' && !selectedClass) {
        toast({
          variant: 'destructive',
          title: 'Aucune classe sélectionnée',
          description: 'Veuillez sélectionner une classe pour démarrer une session de cours.',
        });
        return;
    }

    const sessionTitle = type === 'CLASS' ? `Cours: ${selectedClass?.name}` : 'Réunion';
    const participants = type === 'CLASS' ? selectedClass!.students : meetingCandidates;

    if (participants.length === 0) {
        toast({
            variant: 'warning',
            title: 'Aucun participant',
            description: 'Impossible de démarrer une session sans participants.',
          });
          return;
    }

    try {
      const resultAction = await dispatch(startSession({
        sessionType: type,
        hostId: user.id,
        title: sessionTitle,
        classId: selectedClass?.id.toString(),
        participants: participants.map(p => ({ ...p, id: p.userId, name: p.name || p.email, role: p.role || 'STUDENT' })),
      }));

      if (startSession.fulfilled.match(resultAction)) {
        const newSession = resultAction.payload;
        if(selectedClass) {
          toast({ title: 'Session Démarrée', description: `La session pour ${selectedClass.name} a commencé.`});
          router.push(`/chatroom/session?sessionId=${newSession.id}`);
        }
      } else {
        throw new Error((resultAction.payload as string) || 'Failed to start session');
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: error.message || "Impossible de démarrer la session."
        });
    }
  };

  if ((loading && classes.length === 0) || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Tableau de Bord de la Salle de Classe</h1>
        <p className="text-muted-foreground mt-2">Gérez vos sessions de cours et réunions en direct.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Class Session Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Video /> Session de Classe</CardTitle>
            <CardDescription>Lancez une session vidéo interactive avec une classe.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <Select onValueChange={handleClassSelect} defaultValue={selectedClass?.id.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClass && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {selectedClass.students.length} élèves</p>
                <p className="flex items-center gap-2"><Settings className="h-4 w-4" /> {selectedClass.abbreviation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={() => handleStartSession('CLASS', selectedClass?.id ?? null)} className="w-full sm:w-auto" disabled={!selectedClass || loading}>
              Démarrer la session de classe
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setAddStudentsDialogOpen(true)} disabled={!selectedClass}>
              <UserPlus className="mr-2 h-4 w-4"/> Gérer les élèves
            </Button>
          </CardFooter>
        </Card>

        {/* Meeting Session Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Session de Réunion</CardTitle>
            <CardDescription>Créez une réunion privée avec des enseignants ou du personnel.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {/* Placeholder for meeting participant selection */}
            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                <p>La sélection des participants pour les réunions sera bientôt disponible.</p>
            </div>
          </CardContent>
          <CardFooter>
          <Button className="w-full" disabled>
              Démarrer une réunion
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ChatroomDashboardPage;
