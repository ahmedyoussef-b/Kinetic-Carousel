//src/components/chatroom/student/StudentDashboard.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useLogoutMutation } from '@/lib/redux/api/authApi';
import { addNotification, removeNotification, type AppNotification } from '@/lib/redux/slices/notificationSlice';
import { selectCurrentUser, selectIsAuthenticated } from '@/lib/redux/features/auth/authSlice';
import { Role, type SafeUser } from '@/types';
import { StudentHeader } from './StudentHeader';
import { InvitationList } from './InvitationList';
import { NoInvitations } from './NoInvitations';
import { NotificationList } from './NotificationList';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export default function StudentDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [logout, {isLoading: isLoggingOut}] = useLogoutMutation();
  const { notifications } = useAppSelector(state => state.notifications);
  const prevInvitationsCount = useRef(0);
  const { toast } = useToast();
  const { socket } = useSocket();


  const pendingInvitations: (AppNotification & { actionUrl: string })[] = notifications.filter(
    (n: AppNotification): n is AppNotification & { actionUrl: string } => n.type === 'session_invite' && !!n.actionUrl && !n.read
  );

  useEffect(() => {
    if (!isAuthenticated || user?.role !== Role.STUDENT) {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  // Effect to check for an active session on load
  useEffect(() => {
    const checkForActiveSession = async () => {
      try {
        const response = await fetch('/api/chatroom/sessions/active-for-student');
        if (response.ok) {
          const data = await response.json();
          if (data.activeSessionId) {
            console.log(`[StudentDashboard] Session active ${data.activeSessionId} détectée. Redirection...`);
            router.replace(`/list/chatroom/session?sessionId=${data.activeSessionId}`);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session active:", error);
      }
    };
    checkForActiveSession();
  }, [router]);


  // Effect for receiving notifications from the server via Socket.IO
  useEffect(() => {
      if (!socket || !user) return;
      
      console.log('🎧 [StudentDashboard] Setting up Socket.IO notification listener.');

      const handleNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
        console.log('📬 [StudentDashboard] Received notification via Socket.IO:', notification);
        dispatch(addNotification(notification));
      };
      
      socket.on('session:invite', handleNotification);
      
      return () => {
          console.log('🛑 [StudentDashboard] Clearing Socket.IO notification listener.');
          socket.off('session:invite', handleNotification);
      };
  }, [socket, dispatch, user]);

  // Effect for audio notification
  useEffect(() => {
    const playNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };
      
    if (pendingInvitations.length > prevInvitationsCount.current) {
      playNotificationSound();
    }
    
    prevInvitationsCount.current = pendingInvitations.length;

  }, [pendingInvitations]);


  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push('/login');
    } catch (error) {
       console.error('Failed to logout:', error);
      toast({
        title: 'Erreur de déconnexion',
        description: 'Une erreur est survenue lors de la déconnexion.',
        variant: 'destructive',
      });
    }
  };

  const handleJoinSession = (invitation: AppNotification & { actionUrl: string }) => {
    router.push(invitation.actionUrl);
    dispatch(removeNotification(invitation.id));
  };

  const handleDeclineInvitation = (invitationId: string) => {
    dispatch(removeNotification(invitationId));
  };
  
  if (!user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <StudentHeader user={user as SafeUser} onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bonjour, {user.name} !
            </h2>
            <p className="text-lg text-gray-600">
              Vous recevrez des notifications lorsque vos professeurs lanceront des sessions.
            </p>
          </div>

          {pendingInvitations.length > 0 ? (
            <InvitationList 
              invitations={pendingInvitations}
              onJoin={handleJoinSession}
              onDecline={handleDeclineInvitation}
            />
          ) : (
            <NoInvitations />
          )}

          {notifications.length > 0 && (
            <NotificationList notifications={notifications} />
          )}
        </div>
      </main>
    </div>
  );
}
