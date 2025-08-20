// src/app/(dashboard)/list/teachers/page.tsx

import { getServerSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma, Role } from "@prisma/client";
import { TeacherWithDetails, Class } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TableSearch from "@/components/TableSearch";
import Link from "next/link";
import { PlusCircle, Filter, ArrowUpDown, ArrowLeft, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeacherCard from "@/components/cards/TeacherCard";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";

const ITEM_PER_PAGE = 12;

// --- SPECIFIC TYPE FOR THE NEW VIEW ---
interface ClassTeacherInfo {
    teacherId: string;
    teacherName: string;
    teacherSurname: string;
    subjectId: number;
    subjectName: string;
    weeklyHours: number;
}

const TeachersPage = async ({ searchParams }: { searchParams: { q?: string, p?: string, gradeId?: string, classId?: string } }) => {
    const session = await getServerSession();
    
    if (!session?.user) {
      redirect(`/login`);
    }

    const q = searchParams?.q || "";
    const p = parseInt(searchParams?.p || "1") || 1;
    const gradeId = searchParams?.gradeId;
    const classId = searchParams?.classId;

    // --- NEW LOGIC: DETAILED VIEW FOR A SINGLE CLASS ---
    if (classId) {
        const classData = await prisma.class.findUnique({
            where: { id: parseInt(classId) },
            include: {
                grade: true,
                lessons: {
                    include: {
                        teacher: true,
                        subject: true,
                    },
                    orderBy: {
                        subject: { name: 'asc' }
                    }
                }
            }
        });

        if (!classData) {
            return <div className="p-8 text-center">Classe non trouvée.</div>;
        }

        const teacherInfoMap = new Map<string, ClassTeacherInfo>();

        for (const lesson of classData.lessons) {
            if (lesson.teacher && lesson.subject) {
                const key = `${lesson.teacherId}-${lesson.subjectId}`;
                const durationMinutes = (lesson.endTime.getTime() - lesson.startTime.getTime()) / (1000 * 60);
                const durationHours = durationMinutes / 60;

                if (teacherInfoMap.has(key)) {
                    teacherInfoMap.get(key)!.weeklyHours += durationHours;
                } else {
                    teacherInfoMap.set(key, {
                        teacherId: lesson.teacherId,
                        teacherName: lesson.teacher.name,
                        teacherSurname: lesson.teacher.surname,
                        subjectId: lesson.subjectId,
                        subjectName: lesson.subject.name,
                        weeklyHours: durationHours,
                    });
                }
            }
        }
        
        const classTeachers = Array.from(teacherInfoMap.values());

        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                     <Button variant="outline" size="sm" asChild>
                      <Link href={`/list/classes/${classId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la Classe
                      </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground text-right">{classData.name}</h1>
                        <p className="text-muted-foreground text-right">Liste des enseignants assignés</p>
                    </div>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Users/>
                           Équipe Pédagogique
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Enseignant</TableHead>
                                    <TableHead>Matière</TableHead>
                                    <TableHead className="text-right">Heures/Semaine</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classTeachers.length > 0 ? classTeachers.map(info => (
                                    <TableRow key={`${info.teacherId}-${info.subjectId}`}>
                                        <TableCell className="font-medium">
                                            <Link href={`/list/teachers/${info.teacherId}`} className="hover:underline">
                                                {info.teacherName} {info.teacherSurname}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{info.subjectName}</TableCell>
                                        <TableCell className="text-right">{info.weeklyHours.toFixed(1)}h</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            Aucun enseignant assigné à cette classe dans l'emploi du temps actuel.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            </div>
        );
    }
    
    // --- ORIGINAL VIEW: GRID OF ALL TEACHERS ---
    const query: Prisma.TeacherWhereInput = {};
    if (q) {
        query.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { surname: { contains: q, mode: 'insensitive' } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            { subjects: { some: { name: { contains: q, mode: 'insensitive' } } } },
        ];
    }

    if (gradeId) {
        query.lessons = {
            some: {
                class: {
                    gradeId: parseInt(gradeId)
                }
            }
        };
    }

    const [teachersFromDb, count] = await Promise.all([
        prisma.teacher.findMany({
            where: query, 
            include: {
              user: true, 
              subjects: true,
              lessons: { 
                  select: {
                      class: true
                  },
                  distinct: ['classId']
              },
            },
            orderBy: [{ surname: 'asc' }, {name: 'asc'}],
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),
        prisma.teacher.count({ where: query }), 
    ]);
        
    const teachersWithCount: TeacherWithDetails[] = await Promise.all(teachersFromDb.map(async (t) => {
        const uniqueClasses = Array.from(new Map(t.lessons.map((l: any) => [l.class.id, l.class])).values());
        const totalLessons = await prisma.lesson.count({ where: { teacherId: t.id }});

        return {
            ...t,
            user: t.user,
            subjects: t.subjects,
            classes: uniqueClasses as Class[],
            _count: {
              subjects: t.subjects.length,
              classes: uniqueClasses.length,
              lessons: totalLessons,
            },
        };
    }));

    return (
      <div className="bg-background p-4 md:p-6 rounded-lg flex-1 m-4 mt-0">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-4 md:mb-0">
            Tous les Enseignants
          </h1>
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <TableSearch />
              <div className="flex items-center gap-2 self-end sm:self-auto">
                 <button className="p-2.5 hover:bg-muted rounded-md transition-colors" title="Filtrer">
                  <Filter size={18} className="text-muted-foreground" />
                </button>
                <button className="p-2.5 hover:bg-muted rounded-md transition-colors" title="Trier">
                  <ArrowUpDown size={18} className="text-muted-foreground" />
                </button>
                {session.user.role === Role.ADMIN && (
                  <FormContainer
                    table="teacher"
                    type="create"
                  />
                )}
              </div>
          </div>
        </div>
        
        {teachersWithCount.length === 0 ? (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <p className="text-lg text-muted-foreground">Aucun enseignant trouvé.</p>
            <p className="text-sm mt-2 text-muted-foreground">Essayez d'ajuster votre recherche ou ajoutez un nouvel enseignant.</p>
          </div>
        ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                {teachersWithCount.map((teacher, index) => (
                    <TeacherCard
                        key={teacher.id}
                        teacher={teacher}
                        userRole={session.user.role}
                        isLCP={index < 4}
                    />
                ))}
            </div>
        )}

        {count > ITEM_PER_PAGE && <Pagination page={p} count={count} />}
      </div>
    );
};

export default TeachersPage;
