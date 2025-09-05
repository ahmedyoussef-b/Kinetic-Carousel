// src/app/(dashboard)/list/teachers/[id]/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { type TeacherWithDetails, Role, Lesson, ClassWithGrade, Subject, Classroom, WizardData } from "@/types/index";
import { notFound, redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import TeacherProfileCard from "@/components/teacher/TeacherProfileCard";
import TeacherStatsCards from "@/components/teacher/TeacherStatsCards";
import TeacherShortcuts from "@/components/teacher/TeacherShortcuts";
import { fetchAllDataForWizard } from '@/lib/data-fetching/fetch-wizard-data';
import TimetableDisplay from "@/components/schedule/TimetableDisplay";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SingleTeacherPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const id = params.id;

  const session = await getServerSession();
  const userRole = session?.user?.role as Role | undefined;

  if (!session) redirect(`/login`);

  if (userRole !== Role.ADMIN && userRole !== Role.TEACHER && session?.user.id !== id) {
     redirect(`/${userRole?.toLowerCase() || 'login'}`);
  }
  
  // Fetch wizard data for context, and specifically fetch lessons for this teacher
  const [wizardDataFromDb, teacherLessons] = await Promise.all([
    fetchAllDataForWizard(),
    prisma.lesson.findMany({ where: { teacherId: id } })
  ]);
  
  const teacher = wizardDataFromDb.teachers.find(t => t.id === id);

  if (!teacher) {
    return notFound();
  }
  
  // Construct the specific wizardData for this teacher's schedule display
  const teacherWizardData: WizardData = {
      ...wizardDataFromDb,
      // Ensure the schedule in the wizard data is empty so it doesn't conflict
      schedule: [],
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
            <Link href="/list/teachers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
            </Link>
        </Button>
      </div>
      <div className="flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-1/3">
             <TeacherProfileCard teacher={teacher} userRole={userRole} />
          </div>
          <div className="w-full xl:w-2/3 flex flex-col gap-6">
              <TeacherStatsCards stats={teacher._count} />
              <TeacherShortcuts teacherId={teacher.id} />
          </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Emploi du Temps Personnel</CardTitle>
          <CardDescription>
            Aperçu de l'emploi du temps hebdomadaire pour cet enseignant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableDisplay 
            wizardData={teacherWizardData} 
            viewMode={"teacher"} 
            selectedViewId={teacher.id} 
            scheduleOverride={teacherLessons.map(lesson => ({
              ...lesson,
              startTime: lesson.startTime.toISOString(),
              endTime: lesson.endTime.toISOString(),
              createdAt: "2023-01-01T00:00:00.000Z", // Add dummy createdAt
              updatedAt: "2023-01-01T00:00:00.000Z", // Add dummy updatedAt
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleTeacherPage;
