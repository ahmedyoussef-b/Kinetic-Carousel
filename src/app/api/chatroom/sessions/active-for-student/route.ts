// src/app/api/chatroom/sessions/active-for-student/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { SessionService } from '@/services/session-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo?.user?.id) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }
  const userId = sessionInfo.user.id;

  try {
    const activeSessionId = await SessionService.findSessionIdForParticipant(userId);

    if (activeSessionId) {
      console.log(`[API] Session active trouvée pour l'élève ${userId}: ${activeSessionId}`);
      // FIX: Return the ID in a correctly formatted JSON object.
      return NextResponse.json({ activeSessionId: activeSessionId });
    } else {
      console.log(`[API] Aucune session active trouvée pour l'élève ${userId}.`);
      return NextResponse.json({ activeSessionId: null });
    }
  } catch (error) {
    console.error(`[API] Erreur lors de la recherche de session active pour l'élève ${userId}:`, error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
