// src/components/chatroom/session/ParticipantsPanel.tsx
'use client';

import { useAppSelector, useAppDispatch } from '@/hooks/redux-hooks';
import { toggleMute, toggleSpotlight, removeStudentFromSession } from '@/lib/redux/slices/sessionSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Star, UserX, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionParticipant } from '@/lib/redux/slices/session/types';
import { Role } from '@/types';

interface ParticipantsPanelProps {
  isHost: boolean;
}

export default function ParticipantsPanel({ isHost }: ParticipantsPanelProps) {
  const dispatch = useAppDispatch();
  const { activeSession } = useAppSelector(state => state.session);
  const participants = activeSession?.participants || [];
  const spotlightId = activeSession?.spotlightedParticipantId;
  const hostId = activeSession?.hostId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          Participants ({participants.length})
        </CardTitle>
        <CardDescription>Gérez les participants de la session.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {participants.map((p: SessionParticipant) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", p.isOnline ? 'bg-green-500' : 'bg-gray-400')} />
                  <p className="font-medium text-sm">{p.name} {p.id === hostId && '(Hôte)'}</p>
                </div>
                {isHost && p.id !== hostId && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch(toggleMute(p.id))}>
                      {p.isMuted ? <MicOff className="h-4 w-4 text-red-500"/> : <Mic className="h-4 w-4"/>}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch(toggleSpotlight(p.id))}>
                      <Star className={cn("h-4 w-4", spotlightId === p.id && 'fill-current text-yellow-400')} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => dispatch(removeStudentFromSession(p.id))}>
                      <UserX className="h-4 w-4"/>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
// Test comment