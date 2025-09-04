// src/hooks/useSocket.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from './redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';

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
      
      setSocket(newSocket);

      return () => {
        console.log('🛑 [SocketProvider] Disconnecting socket...');
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
