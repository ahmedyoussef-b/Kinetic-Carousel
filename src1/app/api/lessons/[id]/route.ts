// src/app/api/lessons/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { baseLessonSchema } from '@/lib/formValidationSchemas';
import { Prisma } from '@prisma/client';

const updateLessonSchema = baseLessonSchema.partial().refine(
    (data) => {
        if (data.startTime && data.endTime) {
            return data.endTime > data.startTime;
        }
        return true;
    },
    {
        message: "L'heure de fin doit être après l'heure de début",
        path: ["endTime"],
    }
);


// Helper to construct a Date object from a "HH:mm" string
const createDateFromTime = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(0);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ message: "ID de cours invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = updateLessonSchema.parse(body);

    const { startTime, endTime, classroomId, ...rest } = validatedData;

    const dataToUpdate: any = { ...rest };

    if (startTime) {
      dataToUpdate.startTime = createDateFromTime(startTime);
    }
    if (endTime) {
      dataToUpdate.endTime = createDateFromTime(endTime);
    }
    if (classroomId !== undefined) {
      dataToUpdate.classroomId = classroomId;
    }


    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedLesson);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { 
            return NextResponse.json({ message: 'Cours non trouvé' }, { status: 404 });
        }
        if (error.code === 'P2003') { // Foreign key constraint failed
             return NextResponse.json({ message: "L'une des entités spécifiées (classe, matière, etc.) n'existe pas." }, { status: 400 });
        }
    }
    console.error(`Erreur lors de la mise à jour du cours ${id}:`, error);
    return NextResponse.json({ message: "Erreur lors de la mise à jour du cours", error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: "ID de cours invalide" }, { status: 400 });
    }

    try {
        await prisma.$transaction(async (tx) => {
            const lessonToDelete = await tx.lesson.findUnique({ where: { id } });
            if (!lessonToDelete) {
                // If the lesson is already gone, we can consider the operation a success.
                console.log(`Leçon avec l'ID ${id} déjà supprimée. Aucune action nécessaire.`);
                return;
            }

            const exams = await tx.exam.findMany({ where: { lessonId: id }, select: { id: true } });
            const examIds = exams.map(e => e.id);

            const assignments = await tx.assignment.findMany({ where: { lessonId: id }, select: { id: true } });
            const assignmentIds = assignments.map(a => a.id);
            
            if (examIds.length > 0 || assignmentIds.length > 0) {
              await tx.result.deleteMany({
                  where: {
                      OR: [
                          { examId: { in: examIds } },
                          { assignmentId: { in: assignmentIds } },
                      ],
                  },
              });
            }

            await tx.exam.deleteMany({ where: { lessonId: id } });
            await tx.assignment.deleteMany({ where: { lessonId: id } });
            await tx.attendance.deleteMany({ where: { lessonId: id } });

            await tx.lesson.delete({ where: { id } });
        });

        return NextResponse.json({ message: 'Cours et ses données associées supprimés avec succès' }, { status: 200 });
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ message: 'Cours non trouvé' }, { status: 404 });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
             return NextResponse.json({ message: "La suppression a échoué en raison d'une contrainte de base de données inattendue." }, { status: 409 });
        }
        console.error(`Erreur lors de la suppression du cours ${id}:`, error);
        return NextResponse.json({ message: "Erreur lors de la suppression du cours", error: String(error) }, { status: 500 });
    }
}
