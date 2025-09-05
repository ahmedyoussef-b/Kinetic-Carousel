// src/app/api/schedule-drafts/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import { Prisma } from '@prisma/client';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    console.log("📥 [API PUT /draft/:id] Requête reçue pour mettre à jour le brouillon ID:", params.id);
    const session = await getServerSession();
    if (!session?.user.id ) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    
    try {
        const body = await request.json();
        const {
            name,
            description,
            schoolConfig,
            classIds,
            subjectIds,
            teacherIds,
            roomsId, // Renommé de classroomIds
            gradeIds,
            lessonRequirements = [],
            teacherConstraints = [],
            subjectRequirements = [],
            teacherAssignments = [],
            schedule = [],
        } = body;
        
        console.log(`📝 [API PUT /draft/:id] Mise à jour de "${name}"...`);

        const updatedDraft = await prisma.$transaction(async (tx) => {
            console.log(`✍️ [API PUT /draft/:id] Mise à jour des données principales du brouillon.`);
            const draftUpdatePayload: Prisma.ScheduleDraftUpdateInput = {
                name,
                description,
                schoolConfig: schoolConfig ? JSON.stringify(schoolConfig) : Prisma.JsonNull,
                classes: classIds ? JSON.stringify(classIds) : Prisma.JsonNull,
                subjects: subjectIds ? JSON.stringify(subjectIds) : Prisma.JsonNull,
                teachers: teacherIds ? JSON.stringify(teacherIds) : Prisma.JsonNull,
                rooms: roomsId ? JSON.stringify(roomsId) : Prisma.JsonNull, // Corrigé ici
                grades: gradeIds ? JSON.stringify(gradeIds) : Prisma.JsonNull,
            };
            
            const draft = await tx.scheduleDraft.update({
                where: { id, userId: session.user.id },
                data: draftUpdatePayload,
            });

            if (!draft) {
                throw new Error("Le brouillon à mettre à jour n'a pas été trouvé ou ne vous appartient pas.");
            }
             
            console.log(`🧼 [API PUT /draft/:id] Nettoyage des anciennes relations pour le brouillon ${id}`);
            await tx.lesson.deleteMany({ where: { scheduleDraftId: id } });

            console.log(`✍️ [API PUT /draft/:id] Recréation des nouvelles relations...`);

            // Corrected: Remove the attempt to write to `scheduleDraftId` in related tables.
             if (schedule.length > 0) {
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
                        scheduleDraftId: id, // This is the correct way to link lessons back to the draft
                    })),
                });
            }

            const finalDraft = await tx.scheduleDraft.findUnique({
                where: { id },
                include: { lessons: true }
            });

            if (!finalDraft) {
                throw new Error("Le brouillon n'a pas pu être retrouvé après la mise à jour.");
            }
            
            return finalDraft;
        });

        console.log("✅ [API PUT /draft/:id] Brouillon mis à jour avec succès:", updatedDraft.name);
        return NextResponse.json(updatedDraft, { status: 200 });

    } catch (error: any) {
        console.error(`❌ [API PUT /draft/:id] Erreur lors de la mise à jour du brouillon ${id}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') return NextResponse.json({ message: 'Un scénario avec ce nom existe déjà.' }, { status: 409 });
            if (error.code === 'P2025') return NextResponse.json({ message: 'Scénario non trouvé.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Erreur lors de la mise à jour du scénario.', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    console.log(`🗑️ [API DELETE /draft/:id] Requête reçue pour supprimer le brouillon ID:`, params.id);
    const session = await getServerSession();
    if (!session?.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    try {
        await prisma.$transaction(async (tx) => {
            // Delete lessons associated with the draft first due to the relation
            await tx.lesson.deleteMany({ where: { scheduleDraftId: id }});

            // Now delete the draft itself
            await tx.scheduleDraft.delete({
                where: { id, userId: session.user.id },
            });
        });
        
        console.log(`✅ [API DELETE /draft/:id] Brouillon supprimé avec succès.`);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`❌ [API DELETE /draft/:id] Erreur lors de la suppression du brouillon:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ message: 'Scénario non trouvé.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Erreur lors de la suppression du scénario.' }, { status: 500 });
    }
}
