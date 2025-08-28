// src/app/api/chatroom/reports/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import { Role } from '@/types';
import type { ChatroomSession, User, SessionParticipant as PrismaSessionParticipant } from '@prisma/client';
import type { SessionReport } from '@/lib/redux/slices/reportSlice';

export const dynamic = 'force-dynamic';

// Define a type that includes the relations you are fetching
type ChatroomSessionWithRelations = ChatroomSession & {
  host: User | null;
  participants: (PrismaSessionParticipant & { user: User })[];
  _count: {
    messages: number;
  };
  description: string | null; // Add description property
  title: string; // Add title property
};

export async function GET(request: NextRequest) {
  console.log("➡️ [API] GET /api/chatroom/reports: Requête reçue pour les rapports.");
  const sessionInfo  = await getServerSession();
  if (!sessionInfo?.user?.id) {
    console.warn("❌ [API] GET /api/chatroom/reports: Unauthorized, no user ID found in session.");
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const whereClause: { status: string; hostId?: string } = {
      status: 'ENDED',
    };

    // If the user is a teacher, only fetch their own reports. Admin sees all.
    if (sessionInfo.user.role === Role.TEACHER) {
      whereClause.hostId = sessionInfo.user.id;
      console.log(`[API] Filter applied for teacher ID: ${sessionInfo.user.id}`);
    } else {
      console.log("[API] Administrator requests all reports.");
    }

    const sessions = await prisma.chatroomSession.findMany({
      where: whereClause,
      include: {
        host: true,
        
        participants: {
          include: {
            user: true,
              
          },
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        startTime: 'desc',
      },
    }) as ChatroomSessionWithRelations[]; // Explicitly cast the result
    
    console.log(`[API] ${sessions.length} completed sessions found.`);

    // Format data for the frontend
    const reports: SessionReport[] = sessions.map(session => {
        const startTime = new Date(session.startTime);
        const endTime = session.endTime ? new Date(session.endTime) : new Date();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        return {
            id: session.id,
            // Add the missing properties from ChatroomSessionWithRelations
            description: session.description || '',
            host: session.host || { id: '', name: 'N/A', email: 'N/A', role: Role.TEACHER, image: null }, // Assuming host exists and handling potential null
            title: session.title || '', 
            
            classId: session.classId ? String(session.classId) : '',
            className: session.title,
            teacherId: session.hostId,
            teacherName: session.host?.name || 'N/A',
            startTime: session.startTime.toISOString(),
            endTime: session.endTime?.toISOString() || new Date().toISOString(),
            duration: duration,
            participants: session.participants.map(p => ({
                id: p.userId,
                name: p.user.name || 'Participant inconnu',
                email: p.user.email,
                joinTime: p.joinedAt.toISOString(),
                leaveTime: session.endTime?.toISOString() || new Date().toISOString(),
                duration: duration,
            })),
            maxParticipants: session.participants.length,
            status: 'completed',
            messageCount: session._count.messages,
            reportCount: 0 // Placeholder
        }
    });

    console.log(`✅ [API] Sending ${reports.length} formatted reports.`);
    return NextResponse.json(reports);

  } catch (error) {
    console.error("❌ [API] GET /api/chatroom/reports: Error fetching reports:", error);
    return NextResponse.json({ message: "Erreur lors de la récupération des rapports." }, { status: 500 });
  }
}
