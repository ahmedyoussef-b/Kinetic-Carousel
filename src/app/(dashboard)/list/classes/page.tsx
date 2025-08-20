// src/app/(dashboard)/list/classes/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { type Class, type Grade, type Role as AppRole, type Teacher, type Student } from "@/types/index";
import ClassesView from "@/components/classes/ClassesView";
import { Prisma } from "@prisma/client";

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

    const classesData: ClassWithDetails[] = await prisma.class.findMany({
      where: whereClause,
      include: {
        _count: { select: { students: true } },
        grade: true,
      },
      orderBy: { name: 'asc' },
    }).then(classes => classes.map(c => ({ ...c, supervisor: null })));

    const initialGradeIdParam = typeof searchParams?.viewGradeId === 'string' ? searchParams.viewGradeId : null;

    return <ClassesView
        grades={gradesData}
        classes={classesData}
        userRole={userRole}
        initialGradeIdParam={initialGradeIdParam}
        isTeacherFilteredView={isTeacherFilteredView}
        teacherName={teacherName}
    />;
}
