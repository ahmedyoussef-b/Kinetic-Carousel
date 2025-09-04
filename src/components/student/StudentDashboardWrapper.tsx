// src/components/student/StudentDashboardWrapper.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

export default function StudentDashboardWrapper({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    if (!user || user.role !== Role.STUDENT) {
      router.replace('/');
      return;
    }

    if (!socket) return;

    console.log("👋 [StudentWrapper] Student detected. Setting up presence management via Socket.IO.");
    
    // Announce online status
    socket.emit('presence:online');

    const handleBeforeUnload = () => {
        console.log("🚪 [StudentWrapper] Page unloading. Emitting 'presence:offline'.");
        socket.emit('presence:offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // This cleanup runs when the component unmounts
    return () => {
        console.log("🛑 [StudentWrapper] Component unmounting. Clearing listeners and emitting 'presence:offline'.");
        window.removeEventListener('beforeunload', handleBeforeUnload);
        socket.emit('presence:offline');
    };
  }, [user, router, socket]);

  // If the user is a student, render the actual dashboard content.
  if (user?.role === Role.STUDENT) {
    return <>{children}</>;
  }

  // Otherwise, return null or a loading indicator while redirecting.
  return null;
}
