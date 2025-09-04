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

    // This cleanup runs when the component unmounts (e.g., page navigation, closing tab)
    return () => {
        console.log("🛑 [StudentWrapper] Component unmounting. Disconnecting socket which will trigger 'disconnect' on server.");
        // The 'disconnect' event on the server will handle removing the user from the online list.
    };
  }, [user, router, socket]);

  // If the user is a student, render the actual dashboard content.
  if (user?.role === Role.STUDENT) {
    return <>{children}</>;
  }

  // Otherwise, return null or a loading indicator while redirecting.
  return null;
}
