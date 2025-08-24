'use client';

import VideoTile from './VideoTile';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { toggleMute, toggleSpotlight } from '@/lib/redux/slices/sessionSlice';
import type { SessionParticipant } from '@/lib/redux/slices/session/types';
import { SafeUser } from '@/types';

interface VideoTileItemProps {
  participant: SessionParticipant;
  user: SafeUser | null;
  isHost: boolean;
  isSpotlighted?: boolean;
}

export default function VideoTileItem({ 
  participant, 
  user, 
  isHost, 
  isSpotlighted = false 
}: VideoTileItemProps) {
  const dispatch = useAppDispatch();

  return (
    <VideoTile
      name={participant.id === user?.id ? `${participant.name} (Vous)`: participant.name}
      isOnline={participant.isOnline}
      isTeacher={participant.role === 'TEACHER' || participant.role === 'ADMIN'}
      hasRaisedHand={participant.hasRaisedHand}
      points={participant.points}
      badgeCount={participant.badges?.length}
      isMuted={participant.isMuted}
      isHost={isHost}
      onToggleMute={() => dispatch(toggleMute(participant.id))}
      onToggleSpotlight={() => dispatch(toggleSpotlight(participant.id))}
      isSpotlighted={isSpotlighted}
    />
  );
}