// src/components/student/StudentDashboardWrapper.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser } from '@/lib/redux/features/auth/authSlice';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

// Unified presence update function using sendBeacon for reliability
const updatePresence = (status: 'online' | 'offline') => {
  console.log(`📡 [StudentWrapper] Sending presence status: ${status} via Beacon.`);
  // Use navigator.sendBeacon as it's more reliable for sending data on page unload.
  // It works perfectly for sending data when the page is active as well.
  if (navigator.sendBeacon) {
    const data = new Blob([JSON.stringify({ status })], { type: 'application/json' });
    navigator.sendBeacon('/api/presence/update', data);
  } else {
    // Fallback for older browsers
    fetch('/api/presence/update', {
        method: 'POST',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
    });
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

  return <>{children}</>;
}
