// src/app/(dashboard)/admin/page.tsx
import { Suspense } from 'react';
import AdminPageClient from '@/components/dashboard/admin/AdminPageClient';
import AdminStatsGrid from '@/components/dashboard/admin/AdminStatsGrid';
import AdminSidebar from '@/components/dashboard/admin/AdminSidebar';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

const AdminDashboardPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  return (
    <AdminPageClient>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <AdminStatsGrid />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <AdminSidebar searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </AdminPageClient>
  );
};

export default AdminDashboardPage;
