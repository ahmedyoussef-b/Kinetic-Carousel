// src/app/(dashboard)/teacher/page.tsx
import { getServerSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { fetchAllDataForWizard } from "@/lib/data-fetching/fetch-wizard-data";
import TeacherPageClient from "./TeacherPageClient";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Server component to fetch data and pass it to the client component
export default async function TeacherPage() {
  console.log("🧑‍🏫 [TeacherPage] Rendu de la page d'accueil de l'enseignant. Vérification de la session.");
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== Role.TEACHER) {
    console.warn("🧑‍🏫 [TeacherPage] Session invalide ou rôle incorrect. Redirection...");
    redirect(session ? `/${(session.user.role as string).toLowerCase()}` : `/login`);
    return null; // Stop rendering
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
}
