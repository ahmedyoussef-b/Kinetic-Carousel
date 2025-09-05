
// src/hooks/useSocket.tsx
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from './redux-hooks';
import Pusher from 'pusher-js';
import { updateStudentPresence, studentSignaledPresence } from '@/lib/redux/slices/sessionSlice';
import { addNotification } from '@/lib/redux/slices/notificationSlice';
import { RootState } from '../lib/redux/store';
import { toast } from 'sonner';

interface PusherContextType {
  pusher: Pusher | null;
}

const PusherContext = createContext<PusherContextType>({ pusher: null });

export const usePusher = () => useContext(PusherContext);

export const PusherProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!user) {
      if (pusherRef.current) {
        console.log("🔌 [PusherProvider] User logged out, disconnecting pusher.");
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      return;
    }

    if (pusherRef.current?.connection.state === 'connected') {
      return; // Pusher already initialized and connected
    }

    console.log(`🔌 [PusherProvider] Initializing pusher for user ${user.id}`);

    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher-auth',
      auth: {
        params: {
          user_id: user.id,
          user_info: JSON.stringify({
            id: user.id,
            name: user.name,
            role: user.role
          }),
        },
      },
    });

    const pusher = pusherRef.current;

    // --- PRESENCE CHANNEL FOR ONLINE USERS ---
    const presenceChannel = pusher.subscribe('presence-global');

    presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
      const onlineUserIds = Object.keys(members.members);
      console.log(`📡 [PusherProvider] Subscribed to presence channel. Online users: ${onlineUserIds.length}`);
      dispatch(updateStudentPresence({ onlineUserIds }));
    });

    presenceChannel.bind('pusher:member_added', (member: any) => {
      console.log(`📡 [PusherProvider] User joined: ${member.id}`);
      // You can dispatch an action here if needed to update the user list in real-time
    });

    presenceChannel.bind('pusher:member_removed', (member: any) => {
      console.log(`📡 [PusherProvider] User left: ${member.id}`);
      // You can dispatch an action here if needed
    });

    presenceChannel.bind('student:signaled_presence', (data: { studentId: string }) => {
      console.log(`✋ [PusherProvider] Student ${data.studentId} signaled presence.`);
      dispatch(studentSignaledPresence(data.studentId));
    });


    // --- PRIVATE CHANNEL FOR USER-SPECIFIC NOTIFICATIONS ---
    const privateChannel = pusher.subscribe(`private-user-${user.id}`);

    privateChannel.bind('session:invite', (sessionData: any) => {
      console.log(`📬 [PusherProvider] Received invite for session: ${sessionData.title}`);
      dispatch(addNotification({
        type: 'session_invite',
        title: `Invitation: ${sessionData.title}`,
        message: `De: ${sessionData.host.name || 'Admin'}` ,
        actionUrl: `/list/chatroom/session?sessionId=${sessionData.id}`
      }));
      toast.info(`Nouvelle invitation de ${sessionData.host.name || 'Admin'}`);
    });


    // --- DEBUG LOGGING ---
    pusher.connection.bind('state_change', (states: any) => {
      console.log(`🔌 [Pusher] state changed: ${states.previous} -> ${states.current}`);
    });

    pusher.connection.bind('error', (err: any) => {
      console.error(`❌ [Pusher] Connection error:`, err);
    });

    return () => {
      if (pusher) {
        console.log("🔌 [PusherProvider] Cleanup: disconnecting pusher.");
        pusher.disconnect();
        pusherRef.current = null;
      }
    };
  }, [user, dispatch]);

  return (
    <PusherContext.Provider value={{ pusher: pusherRef.current }}>
      {children}
    </PusherContext.Provider>
  );
};

