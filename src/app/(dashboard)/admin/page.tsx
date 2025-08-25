// src/app/(dashboard)/admin/page.tsx
import { getServerSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Role } from "@/types";
import AdminHeader from '@/components/dashboard/admin/AdminHeader';
import AdminStatsGrid from '@/components/dashboard/admin/AdminStatsGrid';
import AdminSidebar from '@/components/dashboard/admin/AdminSidebar';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession();

  // Server-side authentication check
  if (!session || session.user.role !== Role.ADMIN) {
    console.warn("👑 [AdminPage] Access denied or session invalid. Redirecting to login...");
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AdminStatsGrid />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* AdminSidebar is now a Server Component, so it can fetch its own data */}
          <AdminSidebar 
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
