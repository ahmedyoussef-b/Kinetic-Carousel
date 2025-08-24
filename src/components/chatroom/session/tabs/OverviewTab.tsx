// src/components/chatroom/session/tabs/OverviewTab.tsx
'use client';

import VideoTile from '../VideoTile';
import { UserX } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { moveParticipant, toggleMute, toggleSpotlight } from '@/lib/redux/slices/sessionSlice';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BreakoutRoomsManagement from '../BreakoutRoomsManagement';
import { SafeUser } from '@/types';
import type { ActiveSession, SessionParticipant } from '@/lib/redux/slices/session/types';
import React, { useEffect } from 'react';
import VideoTileItem from '../VideoTileItem';

// Composant DraggableVideoTile séparé
const DraggableVideoTile = React.memo(({ participant, user, isHost, isSpotlighted }: { 
  participant: SessionParticipant, 
  user: SafeUser | null, 
  isHost: boolean,
  isSpotlighted?: boolean,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
      } = useSortable({id: participant.id!});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <VideoTileItem
              participant={participant}
              user={user}
              isHost={isHost}
              isSpotlighted={isSpotlighted}
            />
        </div>
    );
});

DraggableVideoTile.displayName = 'DraggableVideoTile';

interface OverviewTabProps {
  activeSession: ActiveSession;
  user: SafeUser | null;
}

export default function OverviewTab({ activeSession, user }: OverviewTabProps) {
  const dispatch = useAppDispatch();
  const spotlightedParticipantId = useAppSelector(state => state.session.activeSession?.spotlightedParticipantId);
  const isHost = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const uniqueParticipants = React.useMemo(() => {
    const seen = new Set();
    return activeSession.participants.filter(p => {
        const duplicate = seen.has(p.id);
        seen.add(p.id);
        return !duplicate;
    });
  }, [activeSession.participants]);


  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
        const oldIndex = activeSession.participants.findIndex(p => p.id === active.id);
        const newIndex = activeSession.participants.findIndex(p => p.id === over.id);
        dispatch(moveParticipant({ fromIndex: oldIndex, toIndex: newIndex }));
    }
  }

  // Host view when breakout rooms are active
  if (isHost && activeSession.breakoutRooms && activeSession.breakoutRooms.length > 0) {
    return <BreakoutRoomsManagement />;
  }

  if (spotlightedParticipantId) {
    const spotlightedParticipant = uniqueParticipants.find(p => p.id === spotlightedParticipantId);
    const otherParticipants = uniqueParticipants.filter(p => p.id !== spotlightedParticipantId);

    return (
      <div className="flex flex-col h-full gap-4">
        {spotlightedParticipant ? (
          <div className="flex-1 min-h-0">
            <VideoTileItem
                participant={spotlightedParticipant}
                user={user}
                isHost={isHost}
                isSpotlighted={true}
              />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted rounded-lg">
            <UserX className="w-12 h-12 text-muted-foreground"/>
            <p className="ml-4 text-muted-foreground">Participant non trouvé</p>
          </div>
        )}
        <div className="flex-shrink-0">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {otherParticipants.map(p => (
                <div key={p.id} className="w-48 flex-shrink-0">
                   <VideoTileItem
                     participant={p}
                     user={user}
                     isHost={isHost}
                     isSpotlighted={false}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
            items={uniqueParticipants.map(p => p.id!)}
            strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uniqueParticipants.map((participant) => (
                <DraggableVideoTile 
                  key={participant.id}
                  participant={participant} 
                  user={user} 
                  isHost={isHost} 
                />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
