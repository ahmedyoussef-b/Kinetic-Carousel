// src/components/chatroom/session/ParticipantsPanel.tsx
'use client';

import { useAppSelector, useAppDispatch } from '@/hooks/redux-hooks';
import { toggleMute, toggleSpotlight, removeStudentFromSession } from '@/lib/redux/slices/sessionSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import type { SessionParticipant } from '@/lib/redux/slices/session/types';
import ParticipantItem from './ParticipantItem';
import { useEffect } from 'react';

interface ParticipantsPanelProps {
  isHost: boolean;
}

export default function ParticipantsPanel({ isHost }: ParticipantsPanelProps) {
  const dispatch = useAppDispatch();
  const { activeSession } = useAppSelector(state => state.session);
  const participants = activeSession?.participants || [];
  const spotlightId = activeSession?.spotlightedParticipantId;
  const hostId = activeSession?.hostId;

  // Débogage ultime - vérification des doublons
  useEffect(() => {
    console.log('🔍 [ParticipantsPanel] Participants data:', participants);
    console.log('🔍 [ParticipantsPanel] Unique IDs:', participants.map(p => p.id));
    
    const ids = participants.map(p => p.id || p.userId);
    const hasDuplicates = new Set(ids).size !== participants.length;    if (hasDuplicates) {
      console.error('❌ [ParticipantsPanel] DUPLICATE IDs FOUND!');
      const duplicates = participants.filter((p, index, array) => 
        array.findIndex(pp => pp.id === p.id) !== index
      );
      console.error('❌ [ParticipantsPanel] Duplicates:', duplicates);
    } else {
      console.log('✅ [ParticipantsPanel] No duplicate IDs found');
    }
  }, [participants]);

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
          {participants.map((p: SessionParticipant, index) => (
  <ParticipantItem
    key={p.id ||  `participant-${index}-${Date.now()}`} 
    p={p}
    isHost={isHost}
    hostId={hostId}
    spotlightId={spotlightId || undefined}
    onToggleMute={(id) => dispatch(toggleMute(id))}
    onToggleSpotlight={(id) => dispatch(toggleSpotlight(id))}
    onRemove={(id) => dispatch(removeStudentFromSession(id))}
  />
))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}