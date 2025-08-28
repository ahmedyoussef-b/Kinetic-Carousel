// src/app/(dashboard)/teacher/TeacherPageClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TimetableDisplay from "@/components/schedule/TimetableDisplay";
import type { WizardData } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';

interface TeacherPageClientProps {
  teacherId: string;
  wizardData: WizardData;
}

const TeacherPageClient = ({ teacherId, wizardData }: TeacherPageClientProps) => {
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

export default TeacherPageClient;
