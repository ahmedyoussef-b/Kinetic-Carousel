// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux-hooks';
import { io, Socket } from 'socket.io-client';
import { setConnected, setOnlineUsers, addInvitation } from '../lib/redux/slices/socketSlice';
import { RootState } from '../lib/redux/store';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Use NEXT_PUBLIC_SOCKET_URL for both environments, relying on .env files
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

    socketRef.current = io(socketUrl, {
      path: '/api/socket', // Important: specify the path
      transports: ['websocket', 'polling'],
      auth: {
        userId: user.id,
        role: user.role,
      },
    });

    socketRef.current.on('connect', () => {
      dispatch(setConnected(true));
      socketRef.current?.emit('user-online', {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
    });

    socketRef.current.on('disconnect', () => {
      dispatch(setConnected(false));
    });

    socketRef.current.on('users-online', (users: any[]) => {
      dispatch(setOnlineUsers(users));
    });

    socketRef.current.on('receive-invitation', (invitation: any) => {
      dispatch(addInvitation(invitation));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, dispatch]);

  const sendInvitation = (studentSocketId: string, sessionData: any) => {
    socketRef.current?.emit('send-invitation', {
      studentSocketId,
      teacher: user,
      sessionData,
    });
  };

  const respondToInvitation = (invitation: any, accepted: boolean) => {
    socketRef.current?.emit('invitation-response', {
      invitation,
      accepted,
      student: user,
    });
  };

  return {
    socket: socketRef.current,
    sendInvitation,
    respondToInvitation,
  };
};