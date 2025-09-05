// src/app/api/chatroom/teachers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@/types';
import { SessionParticipant } from '@/lib/redux/slices/session/types';

export const dynamic = 'force-dynamic';

interface PrismaTeacherWithUser {
  id: string;
  name: string;
  surname: string;
  img: string | null;
  userId: string;
  user: {
    email: string | null;
    img: string | null;
  } | null;
}

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        img: true,
        userId: true,
        user: { select: { email: true, img: true } },
      },
      orderBy: [{ surname: 'asc' }, { name: 'asc' }],
    }) as PrismaTeacherWithUser[];

    const participants: SessionParticipant[] = teachers.map((t) => ({
 id: t.userId, // Use the USER's ID for the session participant
      userId: t.userId, // Add userId property
      name: `${t.name} ${t.surname}`,
      email: t.user?.email || 'N/A',
      img: t.user?.img || t.img,
      role: Role.TEACHER,
      isOnline: true, // Teachers are considered online for selection
      isInSession: false,
      points: 0,
      badges: [],
      isMuted: false,
      breakoutRoomId: null,
    }));

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Erreur lors de la récupération des professeurs pour le chatroom:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}
