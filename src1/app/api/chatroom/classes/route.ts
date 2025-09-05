// src/app/api/chatroom/classes/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@/types';
import type { SessionParticipant } from '@/lib/redux/slices/session/types';

export const dynamic = 'force-dynamic';

interface PrismaStudentWithUser {
  id: string;
  userId: string;
  name: string;
  surname: string;
  user: {
    email: string | null;
    img: string | null;
  } | null;
}

interface PrismaClassWithStudents {
  id: number;
  name: string;
  students: PrismaStudentWithUser[];
}

export async function GET() {
  try {
    const classesWithStudents = await prisma.class.findMany({
      include: {
        students: {
          select: { id: true, userId: true, name: true, surname: true, user: { select: { email: true, img: true } } },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }) as PrismaClassWithStudents[];

    const classRooms = classesWithStudents.map((cls) => ({
      id: cls.id,
      name: cls.name,
      students: cls.students.map((s): SessionParticipant => ({
        id: s.id, // Garder l'ID du profil Student pour la sélection initiale
        userId: s.userId, // S'assurer que le userId est toujours présent
        name: `${s.name} ${s.surname}`,
        email: s.user?.email || 'N/A',
        img: s.user?.img,
        role: Role.STUDENT,
        isOnline: false, // Correctement initialisé comme hors ligne
        isInSession: false,
        points: 0,
        badges: [],
        isMuted: false,
        breakoutRoomId: null,
      })),
    }));

    return NextResponse.json(classRooms);
  } catch (error) {
    console.error("Erreur lors de la récupération des classes pour le chatroom:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}
