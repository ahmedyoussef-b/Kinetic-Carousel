// src/hooks/useSocket.tsx
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from './redux-hooks';
import { io, Socket } from 'socket.io-client';
import { updateStudentPresence, studentSignaledPresence } from '@/lib/redux/slices/sessionSlice';
import { addNotification } from '@/lib/redux/slices/notificationSlice';
import { RootState } from '../lib/redux/store';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
        if (socketRef.current) {
            console.log("🔌 [SocketProvider] User logged out, disconnecting socket.");
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        return;
    }

    if (socketRef.current?.connected) {
        return; // Socket already initialized and connected
    }
    
    const socketUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || '/'
      : 'http://localhost:3000';
      
    console.log(`🔌 [SocketProvider] Initializing socket connection to ${socketUrl} for user ${user.id}`);


    socketRef.current = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      auth: {
        userId: user.id,
      },
    });

    const socket = socketRef.current;

    // --- DEBUG MIDDLEWARE ---
    socket.onAny((event, ...args) => {
        console.log(`📡 [Socket Client] Received event: '${event}' with data:`, args);
    });
    
    socket.on('connect', () => {
      console.log(`✅ [Socket Client] Connected with ID: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket Client] Disconnected: ${reason}`);
    });
    
    socket.on('connect_error', (err) => {
      console.error(`❌ [Socket Client] Connection error: ${err.message}`);
    });


    // --- CENTRALIZED EVENT LISTENERS ---
    
    socket.on('presence:update', (onlineUserIds: string[]) => {
      console.log(`📡 [SocketProvider] Received presence update. Online users: ${onlineUserIds.length}`);
      dispatch(updateStudentPresence({ onlineUserIds }));
    });

    socket.on('student:signaled_presence', (studentId: string) => {
        console.log(`✋ [SocketProvider] Student ${studentId} signaled presence.`);
        dispatch(studentSignaledPresence(studentId));
    });

    socket.on('session:invite', (sessionData) => {
      console.log(`📬 [SocketProvider] Received invite for session: ${sessionData.title}`);
      dispatch(addNotification({
        type: 'session_invite',
        title: `Invitation: ${sessionData.title}`,
        message: `De: ${sessionData.host.name || 'Admin'}`,
        actionUrl: `/list/chatroom/session?sessionId=${sessionData.id}`
      }));
      toast.info(`Nouvelle invitation de ${sessionData.host.name || 'Admin'}`);
    });


    return () => {
      if (socket) {
        console.log("🔌 [SocketProvider] Cleanup: disconnecting socket.");
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, dispatch]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
