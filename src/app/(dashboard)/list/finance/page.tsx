// src/app/(dashboard)/list/finance/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { Role } from "@/types";
import { redirect } from "next/navigation";
import FinanceDashboard from "@/components/finance/FinanceDashboard";
import { Prisma } from "@prisma/client";

// Define the shape of our Payment data with relations included
const paymentWithDetails = Prisma.validator<Prisma.PaymentFindManyArgs>()({
    include: {
        student: {
            select: {
                id: true,
                name: true,
                surname: true,
                class: {
                    select: { name: true }
                }
            }
        }
    }
});

export type PaymentWithDetails = Prisma.PaymentGetPayload<typeof paymentWithDetails>;


async function getFinanceData(userId: string, userRole: Role) {
    const whereClause: Prisma.PaymentWhereInput = {};

    if (userRole === Role.PARENT) {
        const parent = await prisma.parent.findUnique({
            where: { userId },
            select: { id: true }
        });
        if (!parent) {
            // If for some reason the parent profile doesn't exist, return empty data.
            return { payments: [], stats: { total: 0, paid: 0, pending: 0, overdue: 0 } };
        }
        whereClause.student = {
            parentId: parent.id
        };
    } else if (userRole !== Role.ADMIN) {
        // Teachers and Students shouldn't see this page.
        return null;
    }
    
    // Admins will have an empty whereClause, fetching all payments.

    const payments = await prisma.payment.findMany({
        where: whereClause,
        ...paymentWithDetails,
        orderBy: {
            dueDate: 'desc'
        }
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const paid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
    const overdue = payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0);

    // Convert Date objects to strings for client component compatibility
    const serializablePayments = payments.map(p => ({
        ...p,
        dueDate: p.dueDate.toISOString(),
        paidDate: p.paidDate?.toISOString() || null,
    }));

    return {
        payments: serializablePayments,
        stats: { total, paid, pending, overdue }
    };
}


export default async function FinancePage() {
    const session = await getServerSession();
    
    if (!session?.user?.id || (session.user.role !== Role.ADMIN && session.user.role !== Role.PARENT)) {
        redirect('/login');
    }

    const financeData = await getFinanceData(session.user.id, session.user.role as Role);

    if (!financeData) {
        // This case handles non-admin/non-parent roles that might slip through
        redirect(`/${session.user.role.toLowerCase()}`);
    }

    return <FinanceDashboard initialData={financeData} userRole={session.user.role as Role} />;
}
