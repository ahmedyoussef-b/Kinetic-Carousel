// src/app/(dashboard)/list/chatroom/student/page.tsx
'use client';

import StudentDashboardWrapper from '@/components/student/StudentDashboardWrapper';
import StudentDashboard from '@/components/chatroom/student/StudentDashboard';

export default function StudentChatroomPage() {
  return (
    <StudentDashboardWrapper>
      <StudentDashboard />
    </StudentDashboardWrapper>
  );
}
