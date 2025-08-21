// src/app/api/schedule-drafts/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import { z } from 'zod';
import { Day, TimePreference, type JsonValue } from '@/types';

// --- Reusable Zod Schemas ---
const schoolConfigSchema = z.object({
    name: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    schoolDays: z.array(z.string()),
    sessionDuration: z.number(),
});

const lessonRequirementSchema = z.object({
    classId: z.number(),
    subjectId: z.number(),
    hours: z.number(),
});

const teacherConstraintSchema = z.object({
    id: z.string(),
    teacherId: z.string(),
    day: z.nativeEnum(Day),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().nullable(),
});

const subjectRequirementSchema = z.object({
    subjectId: z.number(),
    requiredRoomId: z.number().nullable(),
    timePreference: z.nativeEnum(TimePreference),
});

const teacherAssignmentSchema = z.object({
    teacherId: z.string(),
    subjectId: z.number(),
    classIds: z.array(z.number()),
});

const lessonSchema = z.object({
    id: z.number().optional(), // Make id optional for creation
    name: z.string(),
    day: z.nativeEnum(Day),
    startTime: z.string().datetime(), // Keep as string to handle time format
    endTime: z.string().datetime(), // Keep as string to handle time format
    subjectId: z.number(),
    classId: z.number(),
    teacherId: z.string(),
    classroomId: z.number().nullable().optional(), // Make optional
    scheduleDraftId: z.string().nullable().optional(), // Make optional
});


const createDraftSchema = z.object({
  name: z.string().min(1, 'Le nom du scénario est requis.'),
  description: z.string().optional(),
  schoolConfig: schoolConfigSchema,
  classIds: z.array(z.number()).optional(),
  subjectIds: z.array(z.number()).optional(),
  teacherIds: z.array(z.string()).optional(),
  classroomIds: z.array(z.number()).optional(),
  gradeIds: z.array(z.number()).optional(),
  lessonRequirements: z.array(lessonRequirementSchema).optional(),
  teacherConstraints: z.array(teacherConstraintSchema).optional(),
  subjectRequirements: z.array(subjectRequirementSchema).optional(),
  teacherAssignments: z.array(teacherAssignmentSchema).optional(),
  schedule: z.array(lessonSchema).optional(),
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
                orderBy: { updatedAt: 'desc' }, // Corrected orderBy
                include: {
                    lessons: true, // Include lessons in the response
                },
            });
            return NextResponse.json(drafts, { status: 200 });
        }
    } catch (error: any) { // Added type annotation
        console.error('❌ [API/schedule-drafts GET] Error:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.', error: error.message }, { status: 500 }); // Include error message
    }
}


export async function POST(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 }); // Changed from session?.userId to session?.user.id
    }

    try {
        const body = await request.json();
        const validation = createDraftSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Données invalides', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, description, schedule, schoolConfig, ...draftData } = validation.data; // Extract schedule and schoolConfig

        await prisma.scheduleDraft.updateMany({ // Update many to set all other drafts inactive
            where: { userId: session.user.id }, // Changed from session.userId to session.user.id
            data: { isActive: false },
        });

        const newDraft = await prisma.scheduleDraft.create({ // Create the new draft
            data: {
                userId: session.user.id,
                name,
                description,
                isActive: true,
                schoolConfig: JSON.stringify(schoolConfig),
                classes: JSON.stringify(draftData.classIds) ,
                subjects: JSON.stringify(draftData.subjectIds) ,
                teachers: JSON.stringify(draftData.teacherIds) ,
                classrooms: JSON.stringify(draftData.classroomIds) ,
                grades: JSON.stringify(draftData.gradeIds) ,
                lessonRequirements: {
                    create: draftData.lessonRequirements?.map(req => ({
                        classId: req.classId, // Added classId
                        subjectId: req.subjectId,
                        hours: req.hours,
                    })) || [],
                },
                teacherConstraints: {
                    create: draftData.teacherConstraints?.map(con => ({
                       day: con.day,
                       startTime: con.startTime,
                       endTime: con.endTime,
                       teacherId: con.teacherId,
                       description: con.description,
                    })) || [],
                },
                subjectRequirements: {
                    create: draftData.subjectRequirements?.map(req => ({
                        subjectId: req.subjectId,
                        requiredRoomId: req.requiredRoomId,
                        timePreference: req.timePreference,
                    })) || [],
                },
                teacherAssignments: {
                    create: draftData.teacherAssignments?.map(assign => ({
                        teacherId: assign.teacherId,
                        subjectId: assign.subjectId, // Added subjectId
                        classIds: assign.classIds,
                    })) || [],
                },
                // Lessons will be created and connected separately
            },
        });

        // Create and connect lessons to the new draft
        if (schedule && schedule.length > 0) {
            await prisma.lesson.createMany({
                data: schedule.map(lesson => ({
                    name: lesson.name,
                    day: lesson.day,
                    startTime: new Date(lesson.startTime),
                    endTime: new Date(lesson.endTime),
                    subjectId: lesson.subjectId,
                    classId: lesson.classId,
                    teacherId: lesson.teacherId,
                    classroomId: lesson.classroomId,
                    scheduleDraftId: newDraft.id, // Connect to the new draft
                })),
            });
        }

        return NextResponse.json(newDraft, { status: 201 }); // Return the created draft
    } catch (error: any) { // Added type annotation for error
        console.error('❌ [API/schedule-drafts POST] Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Zod échouée', errors: error.errors }, { status: 400 });
        }
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
             return NextResponse.json({ message: 'Un scénario avec ce nom existe déjà.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Erreur lors de la création du scénario.', error: error.message }, { status: 500 }); // Return error message
    }
}
