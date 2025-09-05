// src/app/(dashboard)/list/classes/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { type Class, type Grade, type Role as AppRole, type Teacher, type Student } from "@/types/index";
import ClassesView from "@/components/classes/ClassesView";
import ClassCard from "@/components/classes/ClassCard";
import { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// --- TYPE DEFINITIONS ---
export type GradeWithCounts = Grade & {
  _count: {
    classes: number;
    students: number;
  };
  teachers?: { teacherId: string }[]; // Array of teacher IDs
};

export type ClassWithDetails = Omit<Class, 'supervisorId'> & {
  _count: { students: number };
  grade: Grade;
  supervisor: { name: string | null; surname: string | null } | null;
  students?: Student[]; // Added optional students property
};

// --- SERVER COMPONENT (Default Export) ---
export default async function ServerClassesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
    const session = await getServerSession();
    const userRole = session?.user?.role as AppRole | undefined;

    // Fetch grades with class and student counts
    const gradesData: GradeWithCounts[] = await prisma.grade.findMany({
        include: {
        _count: { select: { classes: true, students: true } },
        },
        orderBy: { level: 'asc' },
    });

    // Fetch unique teacher IDs for each grade
    for (const grade of gradesData) {
      const teachersInGrade = await prisma.lesson.findMany({
        where: { class: { gradeId: grade.id } },
        distinct: ['teacherId'],
        select: { teacherId: true }
      });
      grade.teachers = teachersInGrade.filter(t => t.teacherId !== null) as { teacherId: string }[];
    }


    const whereClause: Prisma.ClassWhereInput = {};
    const teacherId = searchParams?.teacherId;
    let isTeacherFilteredView = false;
    let teacherName: string | undefined = undefined;

    if (teacherId && typeof teacherId === 'string') {
        whereClause.lessons = {
            some: {
                teacherId: teacherId,
            }
        };
        isTeacherFilteredView = true;
        const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }});
        if (teacher) {
            teacherName = `${teacher.name} ${teacher.surname}`;
        }
    }
    
    // Check if we need to display a specific grade's classes
    const viewGradeId = searchParams?.viewGradeId;
    if (viewGradeId && typeof viewGradeId === 'string' && !isNaN(Number(viewGradeId))) {
        whereClause.gradeId = Number(viewGradeId);
    }


    const classesData: ClassWithDetails[] = await prisma.class.findMany({
      where: whereClause,
      include: {
        _count: { select: { students: true } },
        grade: true,
      },
      orderBy: { name: 'asc' },
    }).then(classes => classes.map(c => ({ ...c, supervisor: null })));

    // If viewGradeId is present, we render the detailed class list view
    if (viewGradeId) {
        const gradeLevel = classesData[0]?.grade.level;
        return (
            <div className="p-4 md:p-6 animate-in fade-in-0 duration-500">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/list/classes">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour aux Niveaux
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold text-foreground">
                        {`Classes du Niveau ${gradeLevel || ''}`} 
                    </h1>
                    <div></div> {/* Spacer */}
                </div>

                {classesData.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Aucune classe trouvée pour ce niveau.</p> 
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {classesData.map((classItem) => (
                            <ClassCard key={classItem.id} classItem={classItem}  />
                        ))}
                    </div>
                )}
            </div>
        );
    }


    // Otherwise, render the main interactive view with grades
    return <ClassesView
        grades={gradesData}
        classes={classesData} // Pass all classes for potential filtering inside the client component
        userRole={userRole}
        initialGradeIdParam={null} // Let the client component handle selection
        isTeacherFilteredView={isTeacherFilteredView}
        teacherName={teacherName}
    />;
}
