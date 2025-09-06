// src/components/finance/FinanceDashboard.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, PieChart } from 'lucide-react';
import { PaymentWithDetails } from '@/app/(dashboard)/list/finance/page';
import { Role } from '@/types';
import FinanceStats from './FinanceStats';
import PaymentsTable from './PaymentsTable';
import FinanceChart from './FinanceChart';

interface FinanceDashboardProps {
    initialData: {
        payments: (Omit<PaymentWithDetails, 'dueDate' | 'paidDate'> & { dueDate: string; paidDate: string | null })[];
        stats: {
            total: number;
            paid: number;
            pending: number;
            overdue: number;
        };
    };
    userRole: Role;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ initialData, userRole }) => {

    const { payments, stats } = initialData;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">
                            {userRole === Role.ADMIN ? 'Gestion Financière' : 'Mes Finances'}
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        {userRole === Role.ADMIN ? 'Suivi global des frais de scolarité.' : 'Consultez l\'état des frais de scolarité de vos enfants.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4"/>
                        Exporter en PDF
                    </Button>
                    {userRole === Role.ADMIN && (
                        <Button>Ajouter un Paiement</Button>
                    )}
                </div>
            </div>
            
            <FinanceStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Historique des Paiements</CardTitle>
                        <CardDescription>Liste de toutes les transactions enregistrées.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentsTable payments={payments} userRole={userRole} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5"/>
                            Répartition des Statuts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <FinanceChart stats={stats} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FinanceDashboard;
