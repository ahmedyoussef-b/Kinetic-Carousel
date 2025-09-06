// src/components/finance/FinanceStats.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface FinanceStatsProps {
    stats: {
        total: number;
        paid: number;
        pending: number;
        overdue: number;
    };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const FinanceStats: React.FC<FinanceStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Montant Total" 
                value={formatCurrency(stats.total)} 
                icon={DollarSign}
                color="text-blue-500"
            />
            <StatCard 
                title="Total Payé" 
                value={formatCurrency(stats.paid)} 
                icon={CheckCircle}
                color="text-green-500"
            />
            <StatCard 
                title="En Attente" 
                value={formatCurrency(stats.pending)} 
                icon={Clock}
                color="text-orange-500"
            />
            <StatCard 
                title="En Retard" 
                value={formatCurrency(stats.overdue)} 
                icon={AlertCircle}
                color="text-red-500"
            />
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);


export default FinanceStats;
