// src/hooks/useSocket.tsx
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from './redux-hooks';
import { io, Socket } from 'socket.io-client';
import { setConnected, setOnlineUsers, addInvitation, removeInvitation } from '@/lib/redux/slices/sessionSlice';
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
            console.log("🔌 [SocketProvider] Utilisateur déconnecté, fermeture de la connexion socket.");
            socketRef.current.disconnect();
            socketRef.current = null;
            dispatch(setConnected(false));
        }
        return;
    }

    if (socketRef.current) {
        return; // Socket already initialized
    }

    // Use a relative URL by default so it works in any environment (local, staging, prod)
    // The server is configured to listen for socket connections on the same port.
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    console.log(`🔌 [SocketProvider] Initialisation de la connexion socket à ${socketUrl || 'l\'URL actuelle'} pour l'utilisateur ${user.id}`);

    socketRef.current = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      auth: {
        userId: user.id, // Utiliser l'ID utilisateur pour l'authentification
      },
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ [Socket.IO] Connecté avec succès au serveur.');
      dispatch(setConnected(true));
      socket.emit('user:online', {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 [Socket.IO] Déconnecté du serveur.');
      dispatch(setConnected(false));
    });

    socket.on('presence:update', (users: any[]) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on('session:invite', (invitation) => {
      console.log(`📬 [Socket.IO] Invitation reçue pour la session: ${invitation.title}`);
      dispatch(addNotification({
        type: 'session_invite',
        title: `Invitation: ${invitation.title}`,
        message: `De: ${invitation.host.name}`,
        actionUrl: `/list/chatroom/session?sessionId=${invitation.id}`
      }));
      toast.info(`Nouvelle invitation de ${invitation.host.name}`);
    });

    socket.on('invitation:declined', ({ studentName, sessionTitle }) => {
      toast.warning(`${studentName} a décliné l'invitation pour la session "${sessionTitle}".`);
    });

    return () => {
      if (socket) {
        console.log("🔌 [SocketProvider] Nettoyage : déconnexion du socket.");
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
