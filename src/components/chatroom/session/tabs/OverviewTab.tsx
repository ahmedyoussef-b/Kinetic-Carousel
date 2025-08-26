// src/components/chatroom/session/tabs/OverviewTab.tsx
'use client';

import React from 'react';
import { useAppSelector } from '@/hooks/redux-hooks';
import type { SafeUser } from '@/types';
import type { ActiveSession } from '@/lib/redux/slices/session/types';
import VideoChat from '../../video/VideoChat';

interface OverviewTabProps {
  activeSession: ActiveSession;
  user: SafeUser | null;
}

export default function OverviewTab({ activeSession, user }: OverviewTabProps) {
    if (!user || !activeSession) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="h-full">
            <VideoChat 
                roomName={activeSession.id}
                user={user}
            />
        </div>
    );
}
