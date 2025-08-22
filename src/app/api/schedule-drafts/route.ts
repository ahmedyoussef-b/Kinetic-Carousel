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
    const session = await getServerSession();
    if (!session?.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = createDraftSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Données invalides', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { name, description, schoolConfig } = validation.data;
        const { classes, subjects, teachers, rooms: classrooms, grades, lessonRequirements, teacherConstraints, subjectRequirements, teacherAssignments, schedule } = body;
        
        // --- Transactional Draft Creation ---
        const newDraft = await prisma.$transaction(async (tx) => {
            // Deactivate other drafts
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
                    classrooms: JSON.stringify(classrooms),
                    grades: JSON.stringify(grades),
                },
            });
            
             // Create related lessons
            if (schedule && schedule.length > 0) {
                await tx.lesson.createMany({
                    data: schedule.map((lesson: any) => ({
                        ...lesson,
                        id: undefined, // Let Prisma generate the ID
                        scheduleDraftId: draft.id,
                    })),
                });
            }
            
            return draft;
        });


        return NextResponse.json(newDraft, { status: 201 });
    } catch (error: any) { 
        console.error('❌ [API/schedule-drafts POST] Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Zod échouée', errors: error.errors }, { status: 400 });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             return NextResponse.json({ message: 'Un scénario avec ce nom existe déjà.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Erreur lors de la création du scénario.', error: error.message }, { status: 500 });
    }
}
