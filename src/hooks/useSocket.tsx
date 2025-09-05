// src/hooks/useSocket.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from './redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';
import { studentSignaledPresence } from '@/lib/redux/slices/sessionSlice';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // Connect to the socket server
      const newSocket = io({
        path: '/api/socket',
        query: { userId: user.id },
      });

      newSocket.on('connect', () => {
        console.log('✅ [SocketProvider] Connected to Socket.IO server with ID:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 [SocketProvider] Disconnected from Socket.IO server.');
        setIsConnected(false);
      });

      // Écouteur pour le signal de présence
      newSocket.on('student:signaled_presence', (studentId: string) => {
        console.log(`[SocketProvider] Received presence signal for student: ${studentId}`);
        dispatch(studentSignaledPresence(studentId));
      });
      
      setSocket(newSocket);

      return () => {
        console.log('🛑 [SocketProvider] Disconnecting socket...');
        newSocket.off('student:signaled_presence');
        newSocket.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
