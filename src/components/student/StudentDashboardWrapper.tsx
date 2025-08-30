// src/components/student/StudentDashboardWrapper.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

// Unified presence update function using sendBeacon for reliability
const updatePresence = (status: 'online' | 'offline') => {
  console.log(`📡 [StudentWrapper] Sending presence status: ${status}.`);
  
  // The beacon API is best for sending data on page unload, but it doesn't send cookies.
  // The API requires a session, so we must use fetch with credentials.
  // 'keepalive' flag is crucial for making sure the request is sent even when the page is closing.
  try {
    fetch('/api/presence/update', {
        method: 'POST',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        credentials: 'include' // FIX: Ensure cookies are sent with the request
    });
  } catch (e) {
      console.error("Presence update fetch failed:", e);
  }
};

export default function StudentDashboardWrapper({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== Role.STUDENT) {
      // This is a safeguard, middleware should prevent this.
      router.replace('/');
      return;
    }

    console.log("👋 [StudentWrapper] Student detected. Setting up presence management.");
    
    // Initial online signal
    updatePresence('online');

    // Heartbeat to keep the user online every 30 seconds
    const heartbeatInterval = setInterval(() => {
        console.log("💓 [StudentWrapper] Sending heartbeat presence signal.");
        updatePresence('online');
    }, 30000); // Every 30 seconds

    const handleBeforeUnload = () => {
        console.log("🚪 [StudentWrapper] Page unloading. Sending 'offline' status.");
        updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // This cleanup runs when the component unmounts (e.g., on logout or navigating away from the SPA)
    return () => {
        console.log("🛑 [StudentWrapper] Component unmounting. Clearing heartbeat and sending 'offline' status.");
        clearInterval(heartbeatInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updatePresence('offline');
    };
  }, [user, router]);

  // If the user is a student, render the actual dashboard content.
  if (user?.role === Role.STUDENT) {
    return <>{children}</>;
  }

  // Otherwise, return null or a loading indicator while redirecting.
  return null;
}
