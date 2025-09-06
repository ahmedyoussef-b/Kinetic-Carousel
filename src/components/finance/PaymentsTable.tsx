// src/components/finance/PaymentsTable.tsx
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaymentWithDetails } from '@/app/(dashboard)/list/finance/page';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

interface PaymentsTableProps {
    payments: (Omit<PaymentWithDetails, 'dueDate' | 'paidDate'> & { dueDate: string; paidDate: string | null })[];
    userRole: Role;
}

const statusVariantMap = {
    PAID: 'bg-green-100 text-green-800',
    PENDING: 'bg-orange-100 text-orange-800',
    OVERDUE: 'bg-red-100 text-red-800',
};

const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, userRole }) => {
    
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {userRole === Role.ADMIN && <TableHead>Élève</TableHead>}
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Date de Paiement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.map(payment => (
                    <TableRow key={payment.id}>
                        {userRole === Role.ADMIN && (
                            <TableCell className="font-medium">
                                {payment.student.name} {payment.student.surname}
                                <p className="text-xs text-muted-foreground">{payment.student.class?.name}</p>
                            </TableCell>
                        )}
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                            <Badge className={cn("capitalize", statusVariantMap[payment.status as keyof typeof statusVariantMap])}>
                                {payment.status.toLowerCase()}
                            </Badge>
                        </TableCell>
                        <TableCell>{formatDate(payment.dueDate)}</TableCell>
                        <TableCell>{formatDate(payment.paidDate)}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                                    {userRole === Role.ADMIN && <DropdownMenuItem>Marquer comme payé</DropdownMenuItem>}
                                    {userRole === Role.ADMIN && <DropdownMenuItem className="text-destructive">Annuler</DropdownMenuItem>}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                 {payments.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={userRole === Role.ADMIN ? 6 : 5} className="text-center h-24">
                            Aucune transaction trouvée.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default PaymentsTable;
