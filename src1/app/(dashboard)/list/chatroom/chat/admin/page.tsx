// src/app/(dashboard)/list/chatroom/chat/admin/page.tsx
export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-utils';
import { Role } from '@/types';
import { redirect } from 'next/navigation';
import AdminMeetingDashboard from '@/components/chatroom/dashboard/admin/AdminMeetingDashboard';
import type { SessionParticipant } from '@/lib/redux/slices/session/types';

async function getTeachersAsParticipants(): Promise<SessionParticipant[]> {
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
    });

    return teachers.map((t) => ({
        id: t.userId,
        userId: t.userId,
        name: `${t.name} ${t.surname}`,
        email: t.user?.email || 'N/A',
        img: t.user?.img || t.img,
        role: Role.TEACHER,
        isOnline: false, // La présence sera mise à jour côté client
        isInSession: false,
        points: 0,
        badges: [],
        isMuted: false,
        breakoutRoomId: null,
    }));
}


export default async function AdminMeetingPage() {
    const session = await getServerSession();
    if (!session || session.user.role !== Role.ADMIN) {
        redirect('/login');
    }

    const teachers = await getTeachersAsParticipants();

    return <AdminMeetingDashboard teachers={teachers} />;
}
