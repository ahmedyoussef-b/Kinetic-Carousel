// src/app/(dashboard)/teacher/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TimetableDisplay from "@/components/schedule/TimetableDisplay";
import type { WizardData } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';

interface TeacherPageProps {
  teacherId: string;
  wizardData: WizardData;
}

const TeacherPageClient = ({ teacherId, wizardData }: TeacherPageProps) => {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  // Effect to check for an active session on load
  useEffect(() => {
    if (!user) return;
    
    const checkForActiveSession = async () => {
      try {
        // We can reuse the same API endpoint as students
        const response = await fetch('/api/chatroom/sessions/active-for-student', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.activeSessionId) {
            console.log(`[TeacherPage] Session active ${data.activeSessionId} détectée pour le professeur. Redirection...`);
            router.replace(`/list/chatroom/session?sessionId=${data.activeSessionId}`);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session active pour le professeur:", error);
      }
    };
    checkForActiveSession();
  }, [user, router]);


  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon Emploi du Temps Personnel</CardTitle>
          <CardDescription>
            Consultez votre emploi du temps par classe ou pour vous-même.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableDisplay 
            wizardData={wizardData} 
            viewMode={"teacher"} 
            selectedViewId={teacherId} 
          />
        </CardContent>
      </Card>
    </div>
  );
}


// Server component to fetch data and pass it to the client component
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { fetchAllDataForWizard } from "@/lib/data-fetching/fetch-wizard-data";

export default async function TeacherPage() {
  console.log("🧑‍🏫 [TeacherPage] Rendu de la page d'accueil de l'enseignant. Vérification de la session.");
  const session = await getServerSession();

  if (!session || !session.user || session.user.role !== Role.TEACHER) { 
     console.warn("🧑‍🏫 [TeacherPage] Session invalide ou rôle incorrect. Redirection...");
     redirect(session ? `/${(session.user.role as string).toLowerCase()}` : `/login`);
  }

  const teacherFromDb = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
  });

  if (!teacherFromDb) {
    console.error("🧑‍🏫 [TeacherPage] Profil enseignant non trouvé pour l'ID utilisateur:", session.user.id);
    return (
      <div className="p-4 md:p-6 text-center">
        <Card className="inline-block p-8">
            <CardHeader>
                <CardTitle>Profil Enseignant Non Trouvé</CardTitle>
                <CardDescription>
                  Aucun profil d'enseignant n'est associé à ce compte. Veuillez contacter l'administration.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }
  
  const wizardData = await fetchAllDataForWizard();
  
  console.log("🧑‍🏫 [TeacherPage] Rendu de l'emploi du temps.");
  return <TeacherPageClient teacherId={teacherFromDb.id} wizardData={wizardData} />;
};
