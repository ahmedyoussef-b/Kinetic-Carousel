// src/components/chatroom/student/StudentChatroomPage.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useLogoutMutation } from '@/lib/redux/api/authApi';
import { removeNotification, type AppNotification } from '@/lib/redux/slices/notificationSlice';
import { selectCurrentUser, selectIsAuthenticated, selectIsAuthLoading } from '@/lib/redux/features/auth/authSlice';
import { Role, type SafeUser } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { InvitationList } from '@/components/chatroom/student/InvitationList';
import { StudentHeader } from '@/components/chatroom/student/StudentHeader';
import { NoInvitations } from '@/components/chatroom/student/NoInvitations';
import { NotificationList } from '@/components/chatroom/student/NotificationList';
import { Spinner } from '@/components/ui/spinner';

function WelcomeMessage({ name }: { name: string | null }) {
  return (
    <h2 className="text-2xl font-bold text-gray-800">Bienvenue, {name || 'étudiant'} !</h2>
  );
}

// Function to update presence status
const updatePresence = (status: 'online' | 'offline') => {
  navigator.sendBeacon('/api/presence/update', JSON.stringify({ status }));
};


export default function StudentChatroomPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { toast } = useToast();
  const { notifications } = useAppSelector(state => state.notifications);

  const pendingInvitations = notifications.filter(
    (n: AppNotification): n is AppNotification & { actionUrl: string } => n.type === 'session_invite' && !!n.actionUrl && !n.read
  );

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated || user?.role !== Role.STUDENT) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, router, isAuthLoading]);

  // Effect to handle user presence
  useEffect(() => {
      if (user?.role === Role.STUDENT) {
          // Set user to online when component mounts
          updatePresence('online');

          const handleBeforeUnload = () => {
              updatePresence('offline');
          };

          window.addEventListener('beforeunload', handleBeforeUnload);

          // Set user to offline when component unmounts
          return () => {
              window.removeEventListener('beforeunload', handleBeforeUnload);
              updatePresence('offline');
          };
      }
  }, [user]);

  const handleLogout = async () => {
    try {
      updatePresence('offline');
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

  if (isAuthLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <StudentHeader user={user as SafeUser} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <WelcomeMessage name={user.name} />
        
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
      </main>
    </div>
  );
}
