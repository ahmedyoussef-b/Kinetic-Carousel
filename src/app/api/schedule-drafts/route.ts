// src/app/api/schedule-drafts/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';
import { Day, TimePreference, type JsonValue } from '@/types';
import { Prisma } from '@prisma/client';

// --- Reusable Zod Schemas ---
const schoolConfigSchema = z.object({
    name: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    schoolDays: z.array(z.string()),
    sessionDuration: z.number(),
});

const createDraftSchema = z.object({
  name: z.string().min(1, 'Le nom du scénario est requis.'),
  description: z.string().optional(),
  schoolConfig: schoolConfigSchema,
});


export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const getActiveOnly = searchParams.get('active') === 'true';

    try {
        if (getActiveOnly) {
             const activeDraft = await prisma.scheduleDraft.findFirst({
                where: {
                    userId: session.user.id,
                    isActive: true,
                },
                include: {
                    lessons: true, // Include lessons in the response
                },
            });
            return NextResponse.json(activeDraft, { status: 200 });
        } else {
            const drafts = await prisma.scheduleDraft.findMany({
                where: { userId: session.user.id },
                orderBy: { updatedAt: 'desc' }, 
                include: {
                    lessons: true, // Include lessons in the response
                },
            });
            return NextResponse.json(drafts, { status: 200 });
        }
    } catch (error: any) { 
        console.error('❌ [API/schedule-drafts GET] Error:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.', error: error.message }, { status: 500 }); 
    }
}


export async function POST(request: NextRequest) {
    console.log("📥 [API POST /drafts] Requête reçue pour créer un nouveau brouillon.");
    const session = await getServerSession();
    if (!session?.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = createDraftSchema.safeParse(body);

        if (!validation.success) {
            console.error("❌ [API POST /drafts] Erreur de validation Zod:", validation.error.flatten());
            return NextResponse.json({ message: 'Données invalides', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { name, description, schoolConfig } = validation.data;
        const { classes, subjects, teachers, rooms, grades, lessonRequirements, teacherConstraints, subjectRequirements, teacherAssignments, schedule } = body;
        
        console.log(`✍️ [API POST /drafts] Démarrage de la transaction pour le brouillon "${name}"...`);
        const newDraft = await prisma.$transaction(async (tx) => {
            // Deactivate other drafts first
            await tx.scheduleDraft.updateMany({
                where: { userId: session.user.id },
                data: { isActive: false },
            });
            
            // Create the main draft record
            const draft = await tx.scheduleDraft.create({
                data: {
                    userId: session.user.id,
                    name,
                    description,
                    isActive: true,
                    schoolConfig: JSON.stringify(schoolConfig),
                    classes: JSON.stringify(classes),
                    subjects: JSON.stringify(subjects),
                    teachers: JSON.stringify(teachers),
                    classrooms: JSON.stringify(rooms),
                    grades: JSON.stringify(grades),
                },
            });
            console.log(`✅ [API POST /drafts] Brouillon principal créé avec ID: ${draft.id}`);


            // Now create related records with the new draft's ID
            if (lessonRequirements && lessonRequirements.length > 0) {
              await tx.lessonRequirement.createMany({
                data: lessonRequirements.map((req: any) => ({ ...req, id: undefined, scheduleDraftId: draft.id }))
              });
            }
            if (teacherConstraints && teacherConstraints.length > 0) {
              await tx.teacherConstraint.createMany({
                data: teacherConstraints.map((c: any) => ({ ...c, id: undefined, scheduleDraftId: draft.id }))
              });
            }
            if (subjectRequirements && subjectRequirements.length > 0) {
              await tx.subjectRequirement.createMany({
                data: subjectRequirements.map((req: any) => ({...req, id: undefined, scheduleDraftId: draft.id }))
              });
            }
            
            if (teacherAssignments && Array.isArray(teacherAssignments)) {
                for (const assignment of teacherAssignments) {
                    const { classIds, ...restOfAssignment } = assignment;
                    await tx.teacherAssignment.create({
                        data: {
                            teacherId: restOfAssignment.teacherId,
                            subjectId: restOfAssignment.subjectId,
                            scheduleDraftId: draft.id,
                            classAssignments: {
                                create: classIds.map((classId: number) => ({
                                    class: { connect: { id: classId } }
                                }))
                            }
                        },
                    });
                }
            }

            if (schedule && schedule.length > 0) {
                await tx.lesson.createMany({
                    data: schedule.map((lesson: any) => ({
                        name: lesson.name,
                        day: lesson.day,
                        startTime: new Date(lesson.startTime),
                        endTime: new Date(lesson.endTime),
                        subjectId: lesson.subjectId,
                        classId: lesson.classId,
                        teacherId: lesson.teacherId,
                        classroomId: lesson.classroomId,
                        scheduleDraftId: draft.id,
                        optionalSubjectId: lesson.optionalSubjectId
                    })),
                });
            }
            
            console.log(`🔗 [API POST /drafts] Toutes les données associées ont été liées au brouillon ${draft.id}.`);
            return draft;
        });

        console.log("✅ [API POST /drafts] Transaction terminée avec succès.");
        return NextResponse.json(newDraft, { status: 201 });

    } catch (error: any) { 
        console.error('❌ [API/schedule-drafts POST] Erreur:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Zod échouée', errors: error.errors }, { status: 400 });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             return NextResponse.json({ message: 'Un scénario avec ce nom existe déjà.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Erreur lors de la création du scénario.', error: error.message }, { status: 500 });
    }
}
